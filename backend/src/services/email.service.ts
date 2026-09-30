import prisma from "../config/database.js";
import { emailQueue } from "../queues/email.queue.js";
import { indexEmail } from "./elasticsearch.service.js";

interface ScheduleEmailInput {
  campaignId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: Date;
}

export async function scheduleEmail(input: ScheduleEmailInput) {
  const idempotencyKey =
    `${input.campaignId}:${input.recipient}:${input.scheduledAt.getTime()}`;

  const existingEmail = await prisma.email.findUnique({
    where: {
      idempotencyKey,
    },
  });

  if (existingEmail) {
    return existingEmail;
  }

  const email = await prisma.email.create({
    data: {
      campaignId: input.campaignId,
      senderId: input.senderId,
      recipient: input.recipient,
      subject: input.subject,
      body: input.body,
      scheduledAt: input.scheduledAt,
      idempotencyKey,
    },
  });

  await indexEmail(email);

  const delay = Math.max(
    input.scheduledAt.getTime() - Date.now(),
    0
  );

  const job = await emailQueue.add(
    "send-email",
    {
      emailId: email.id,
    },
    {
      delay,
      jobId: email.id,
    }
  );

  const updatedEmail = await prisma.email.update({
    where: {
      id: email.id,
    },
    data: {
      bullmqJobId: job.id,
    },
  });

  await indexEmail(updatedEmail);

  return updatedEmail;
}