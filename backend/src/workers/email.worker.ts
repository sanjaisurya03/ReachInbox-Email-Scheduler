import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis.js";
import {
  EMAIL_QUEUE_NAME,
  emailQueue,
} from "../queues/email.queue.js";
import prisma from "../config/database.js";
import { reserveSendSlot } from "../services/rate-limit.service.js";
import { sendEmail } from "../services/smtp.service.js";
import { sendSlackNotification } from "../services/slack.service.js";
import { indexEmail } from "../services/elasticsearch.service.js";

interface EmailJobData {
  emailId: string;
}

const emailWorker = new Worker<EmailJobData>(
  EMAIL_QUEUE_NAME,
  async (job: Job<EmailJobData>) => {
    console.log("----------------------------------------");
    console.log("Processing BullMQ job");
    console.log("Job ID:", job.id);
    console.log("Email ID:", job.data.emailId);

    const claimResult = await prisma.email.updateMany({
      where: {
        id: job.data.emailId,
        status: "SCHEDULED",
      },
      data: {
        status: "PROCESSING",
      },
    });

    if (claimResult.count === 0) {
      console.log(
        `Email ${job.data.emailId} is already being processed, sent, or failed.`
      );
      return;
    }

    const email = await prisma.email.findUnique({
      where: {
        id: job.data.emailId,
      },
      include: {
        sender: true,
      },
    });

    if (!email) {
      throw new Error(
        `Email ${job.data.emailId} was not found after claiming`
      );
    }

    console.log("Recipient:", email.recipient);
    console.log("Subject:", email.subject);
    console.log("Email claimed successfully for processing");

    const rateLimit = await reserveSendSlot(email.senderId);

    if (!rateLimit.allowed) {
      console.log("----------------------------------------");
      console.log("Email send delayed");
      console.log("Reason:", rateLimit.reason);
      console.log("Current count:", rateLimit.count);
      console.log("Hourly limit:", rateLimit.limit);
      console.log("Delay:", rateLimit.delayMs, "ms");

      const scheduledEmail = await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          status: "SCHEDULED",
        },
      });

      try {
        await indexEmail(scheduledEmail);
      } catch (error) {
        console.error(
          "Elasticsearch update failed while rescheduling:",
          error
        );
      }

      const delayedJobId = `${email.id}-retry-${Date.now()}`;

      await emailQueue.add(
        "send-email",
        {
          emailId: email.id,
        },
        {
          jobId: delayedJobId,
          delay: rateLimit.delayMs,
        }
      );

      const updatedEmail = await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          bullmqJobId: delayedJobId,
        },
      });

      try {
        await indexEmail(updatedEmail);
      } catch (error) {
        console.error(
          "Elasticsearch update failed after rescheduling:",
          error
        );
      }

      try {
        await sendSlackNotification(
          `⚠️ ReachInbox rate limit reached\n\n` +
            `Sender: ${email.sender.email}\n` +
            `Current count: ${rateLimit.count}\n` +
            `Hourly limit: ${rateLimit.limit}\n` +
            `Email delayed: ${email.recipient}\n` +
            `Retry delay: ${rateLimit.delayMs} ms`
        );

        console.log(
          "Slack rate-limit notification sent successfully"
        );
      } catch (slackError) {
        console.error(
          "Slack rate-limit notification failed:",
          slackError instanceof Error
            ? slackError.message
            : slackError
        );
      }

      console.log(`Email rescheduled as job ${delayedJobId}`);
      console.log("----------------------------------------");

      return;
    }

    try {
      const result = await sendEmail({
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
      });

      const sentEmail = await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          status: "SENT",
          sentAt: new Date(),
          messageId: result.messageId,
        },
      });

      try {
        await indexEmail(sentEmail);
        console.log(
          "Elasticsearch updated successfully for SENT email"
        );
      } catch (elasticError) {
        console.error(
          "Elasticsearch update failed after email was sent:",
          elasticError
        );
      }

      console.log("Email sent successfully");
      console.log("Message ID:", result.messageId);
      console.log("Ethereal Preview URL:", result.previewUrl);
      console.log(`Email ${email.id} marked as SENT`);
      console.log("----------------------------------------");

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown email error";

      const failedEmail = await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          status: "FAILED",
          errorMessage,
        },
      });

      try {
        await indexEmail(failedEmail);
        console.log(
          "Elasticsearch updated successfully for FAILED email"
        );
      } catch (elasticError) {
        console.error(
          "Elasticsearch update failed after email failure:",
          elasticError
        );
      }

      console.error(
        `Failed to send email ${email.id}:`,
        errorMessage
      );

      try {
        await sendSlackNotification(
          `❌ ReachInbox email failed\n\n` +
            `Email ID: ${email.id}\n` +
            `Recipient: ${email.recipient}\n` +
            `Subject: ${email.subject}\n` +
            `Error: ${errorMessage}`
        );

        console.log(
          "Slack failure notification sent successfully"
        );
      } catch (slackError) {
        console.error(
          "Slack failure notification failed:",
          slackError instanceof Error
            ? slackError.message
            : slackError
        );
      }

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: Number(
      process.env.WORKER_CONCURRENCY || 2
    ),
  }
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, error) => {
  console.error(
    `Job ${job?.id} failed:`,
    error.message
  );
});

console.log("ReachInbox email worker is running...");
console.log(
  "Worker concurrency:",
  Number(process.env.WORKER_CONCURRENCY || 2)
);
console.log(
  `Listening to queue: ${EMAIL_QUEUE_NAME}`
);