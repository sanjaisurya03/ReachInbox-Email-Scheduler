import { Request, Response, NextFunction } from "express";
import { scheduleEmail } from "../services/email.service.js";

export async function createScheduledEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      campaignId,
      senderId,
      recipient,
      subject,
      body,
      scheduledAt,
    } = req.body;

    if (
      !campaignId ||
      !senderId ||
      !recipient ||
      !subject ||
      !body ||
      !scheduledAt
    ) {
      return res.status(400).json({
        success: false,
        message: "All email scheduling fields are required",
      });
    }

    const scheduleDate = new Date(scheduledAt);

    if (Number.isNaN(scheduleDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduledAt value",
      });
    }

    if (scheduleDate.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "scheduledAt must be a future time",
      });
    }

    const email = await scheduleEmail({
      campaignId,
      senderId,
      recipient,
      subject,
      body,
      scheduledAt: scheduleDate,
    });

    return res.status(201).json({
      success: true,
      message: "Email scheduled successfully",
      data: email,
    });
  } catch (error) {
    next(error);
  }
}