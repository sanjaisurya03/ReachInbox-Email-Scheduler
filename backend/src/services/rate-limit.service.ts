import { redisConnection } from "../config/redis.js";
import { sendSlackNotification } from "./slack.service.js";

const MIN_DELAY_MS = Number(
  process.env.EMAIL_MIN_DELAY_MS || 2000
);

const MAX_EMAILS_PER_HOUR = Number(
  process.env.MAX_EMAILS_PER_HOUR_PER_SENDER || 200
);

export interface RateLimitReservation {
  allowed: boolean;
  delayMs: number;
  count: number;
  limit: number;
  reason: "allowed" | "minimum-delay" | "hourly-limit";
}

export async function reserveSendSlot(
  senderId: string
): Promise<RateLimitReservation> {
  const now = Date.now();

  const hourWindow = Math.floor(now / 3_600_000);

  const countKey = `email-rate:${senderId}:${hourWindow}`;
  const lastSendKey = `email-last-send:${senderId}`;

  const script = `
    local count = tonumber(redis.call("GET", KEYS[1]) or "0")
    local lastSend = tonumber(redis.call("GET", KEYS[2]) or "0")

    local now = tonumber(ARGV[1])
    local minDelay = tonumber(ARGV[2])
    local hourlyLimit = tonumber(ARGV[3])
    local nextHour = tonumber(ARGV[4])

    if count >= hourlyLimit then
      return {0, nextHour - now, count, 2}
    end

    if lastSend > 0 and (now - lastSend) < minDelay then
      return {
        0,
        minDelay - (now - lastSend),
        count,
        1
      }
    end

    redis.call("INCR", KEYS[1])
    redis.call("EXPIRE", KEYS[1], 7200)
    redis.call("SET", KEYS[2], now)

    return {
      1,
      0,
      count + 1,
      0
    }
  `;

  const nextHour =
    (hourWindow + 1) * 3_600_000;

  const result = (await redisConnection.eval(
    script,
    2,
    countKey,
    lastSendKey,
    now,
    MIN_DELAY_MS,
    MAX_EMAILS_PER_HOUR,
    nextHour
  )) as [number, number, number, number];

  const [
    allowed,
    delayMs,
    count,
    reasonCode,
  ] = result;

  if (allowed === 1) {
    return {
      allowed: true,
      delayMs: 0,
      count,
      limit: MAX_EMAILS_PER_HOUR,
      reason: "allowed",
    };
  }

  const reason =
    reasonCode === 2
      ? "hourly-limit"
      : "minimum-delay";

  if (reason === "hourly-limit") {
    try {
      const notificationKey =
        `email-rate-notified:${senderId}:${hourWindow}`;

      const notificationLock =
        await redisConnection.set(
          notificationKey,
          "1",
          "EX",
          7200,
          "NX"
        );

      if (notificationLock === "OK") {
        await sendSlackNotification(
          `⚠️ ReachInbox rate limit reached\n\n` +
          `Sender ID: ${senderId}\n` +
          `Hourly limit: ${MAX_EMAILS_PER_HOUR}\n` +
          `Current count: ${count}\n\n` +
          `New emails will be delayed until the next hourly window.`
        );

        console.log(
          `Slack rate-limit notification sent for sender ${senderId}`
        );
      } else {
        console.log(
          `Slack notification already sent for sender ${senderId} in this hour`
        );
      }
    } catch (error) {
      console.error(
        "Slack rate-limit notification failed:",
        error instanceof Error
          ? error.message
          : error
      );
    }
  }

  return {
    allowed: false,
    delayMs,
    count,
    limit: MAX_EMAILS_PER_HOUR,
    reason,
  };
}