import "dotenv/config";
import { sendSlackNotification } from "./services/slack.service.js";

async function main() {
  try {
    await sendSlackNotification(
      "🚀 ReachInbox Slack integration test successful!"
    );

    console.log("Slack test completed successfully.");
  } catch (error) {
    console.error("Slack test failed:", error);
    process.exit(1);
  }
}

main();