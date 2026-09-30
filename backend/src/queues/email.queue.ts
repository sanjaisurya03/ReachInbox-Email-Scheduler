import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const EMAIL_QUEUE_NAME = "reachinbox-email-queue";

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redisConnection,

  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: false,
    removeOnFail: false,
  },
});