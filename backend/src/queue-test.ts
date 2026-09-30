import { emailQueue } from "./queues/email.queue";

async function scheduleTestJob() {
  const scheduledFor = new Date(Date.now() + 15000);

  const job = await emailQueue.add(
    "test-email",
    {
      emailId: "test-email-001",
      recipient: "demo@example.com",
      subject: "ReachInbox BullMQ Test",
    },
    {
      delay: 15000,
      jobId: "test-email-001",
    }
  );

  console.log("Test job scheduled successfully");
  console.log(`Job ID: ${job.id}`);
  console.log(`Scheduled for: ${scheduledFor.toISOString()}`);

  await emailQueue.close();
}

scheduleTestJob().catch((error) => {
  console.error("Failed to schedule test job:", error);
  process.exit(1);
});