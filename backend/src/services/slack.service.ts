import { WebClient } from "@slack/web-api";

const slackToken = process.env.SLACK_BOT_TOKEN;
const slackChannelId = process.env.SLACK_CHANNEL_ID;

if (!slackToken) {
  throw new Error("SLACK_BOT_TOKEN is missing from .env");
}

if (!slackChannelId) {
  throw new Error("SLACK_CHANNEL_ID is missing from .env");
}

const slackClient = new WebClient(slackToken);

export async function sendSlackNotification(message: string) {
  const result = await slackClient.chat.postMessage({
    channel: slackChannelId as string,
    text: message,
  });

  console.log("Slack notification sent successfully");
  console.log("Slack timestamp:", result.ts);

  return result;
}