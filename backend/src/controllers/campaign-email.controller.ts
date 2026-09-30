import { Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { scheduleEmail } from "../services/email.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";


// ======================================================
// ADD SINGLE CAMPAIGN EMAIL
// ======================================================

export async function addCampaignEmail(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const campaignId = String(req.params.id);

    const {
      senderId,
      recipient,
      scheduledAt,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!senderId || !recipient) {
      return res.status(400).json({
        success: false,
        message: "senderId and recipient are required",
      });
    }

    // -----------------------------------------------
    // FIND CAMPAIGN
    // -----------------------------------------------

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    // -----------------------------------------------
    // FIND SENDER
    // -----------------------------------------------

    const sender = await prisma.sender.findFirst({
      where: {
        id: senderId,
        userId,
      },
    });

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }

    // -----------------------------------------------
    // USE PROVIDED DATE OR CAMPAIGN START TIME
    // -----------------------------------------------

    const scheduleDate = scheduledAt
      ? new Date(scheduledAt)
      : new Date(campaign.startTime);

    if (Number.isNaN(scheduleDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled time",
      });
    }

    if (scheduleDate.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Campaign start time must be in the future",
      });
    }

    // -----------------------------------------------
    // SCHEDULE EMAIL
    // -----------------------------------------------

    const email = await scheduleEmail({
      campaignId: campaign.id,
      senderId: sender.id,
      recipient: recipient.trim(),
      subject: campaign.subject,
      body: campaign.body,
      scheduledAt: scheduleDate,
    });

    return res.status(201).json({
      success: true,
      message: "Email scheduled successfully",
      data: email,
    });

  } catch (error) {
    console.error("ADD CAMPAIGN EMAIL ERROR:", error);
    next(error);
  }
}


// ======================================================
// ADD BULK CAMPAIGN EMAILS
// ======================================================

export async function addBulkCampaignEmails(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const campaignId = String(req.params.id);

    const {
      senderId,
      recipients,
      scheduledAt,
    } = req.body;

    console.log("======================================");
    console.log("BULK EMAIL REQUEST");
    console.log("Campaign ID:", campaignId);
    console.log("User ID:", userId);
    console.log("Sender ID:", senderId);
    console.log("Recipients:", recipients);
    console.log("Scheduled At:", scheduledAt);
    console.log("======================================");

    // -----------------------------------------------
    // AUTH CHECK
    // -----------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // -----------------------------------------------
    // VALIDATE RECIPIENTS
    // -----------------------------------------------

    if (
      !Array.isArray(recipients) ||
      recipients.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Recipients array is required",
      });
    }

    // -----------------------------------------------
    // VALIDATE SENDER
    // -----------------------------------------------

    if (!senderId) {
      return res.status(400).json({
        success: false,
        message: "senderId is required",
      });
    }

    // -----------------------------------------------
    // FIND CAMPAIGN
    // -----------------------------------------------

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    // -----------------------------------------------
    // FIND SENDER
    // -----------------------------------------------

    const sender = await prisma.sender.findFirst({
      where: {
        id: senderId,
        userId,
      },
    });

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }

    // -----------------------------------------------
    // DETERMINE FIRST EMAIL TIME
    // -----------------------------------------------

    const firstScheduledTime = scheduledAt
      ? new Date(scheduledAt)
      : new Date(campaign.startTime);

    if (Number.isNaN(firstScheduledTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled time",
      });
    }

    if (firstScheduledTime.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Campaign start time must be in the future",
      });
    }

    // -----------------------------------------------
    // CLEAN RECIPIENT LIST
    // -----------------------------------------------

    const uniqueRecipients = [
      ...new Set(
        recipients
          .map((recipient: unknown) => {
            if (typeof recipient !== "string") {
              return "";
            }

            return recipient.trim().toLowerCase();
          })
          .filter((recipient: string) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
              recipient
            );
          })
      ),
    ];

    if (uniqueRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid email addresses found",
      });
    }

    console.log(
      "Valid recipients:",
      uniqueRecipients
    );

    // -----------------------------------------------
    // CREATE/SCHEDULE EMAILS
    // -----------------------------------------------

    const emails = [];

    for (
      let index = 0;
      index < uniqueRecipients.length;
      index++
    ) {
      const recipient = uniqueRecipients[index];

      // Each email is separated by campaign.delayMs
      const emailScheduledAt = new Date(
        firstScheduledTime.getTime() +
        index * campaign.delayMs
      );

      console.log(
        `Scheduling ${recipient} at ${emailScheduledAt.toISOString()}`
      );

      const email = await scheduleEmail({
        campaignId: campaign.id,
        senderId: sender.id,
        recipient,
        subject: campaign.subject,
        body: campaign.body,
        scheduledAt: emailScheduledAt,
      });

      emails.push(email);
    }

    // -----------------------------------------------
    // SUCCESS
    // -----------------------------------------------

    console.log(
      `${emails.length} emails successfully scheduled`
    );

    return res.status(201).json({
      success: true,
      message: `${emails.length} emails added to campaign and scheduled successfully`,
      count: emails.length,
      data: emails,
    });

  } catch (error) {
    console.error("======================================");
    console.error("BULK EMAIL ERROR");
    console.error(error);
    console.error("======================================");

    next(error);
  }
}