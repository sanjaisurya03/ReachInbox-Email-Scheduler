import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { sendSlackNotification } from "../services/slack.service.js";

const router = Router();

router.use(authenticate);

router.post("/test", async (req, res) => {
  try {
    const message =
      req.body?.message || "ReachInbox Slack integration is working!";

    const result = await sendSlackNotification(message);

    res.status(200).json({
      success: true,
      message: "Slack notification sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Slack route error:", error);

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Slack notification failed",
    });
  }
});

export default router;