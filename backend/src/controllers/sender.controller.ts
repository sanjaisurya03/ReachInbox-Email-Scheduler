import { Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export async function createSender(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    const {
      name,
      email,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      !name ||
      !email ||
      !smtpHost ||
      smtpPort === undefined ||
      !smtpUser ||
      !smtpPass
    ) {
      return res.status(400).json({
        success: false,
        message: "All sender fields are required",
      });
    }

    const existingSender = await prisma.sender.findFirst({
      where: {
        userId,
        email,
      },
    });

    if (existingSender) {
      return res.status(409).json({
        success: false,
        message: "Sender already exists",
      });
    }

    const sender = await prisma.sender.create({
      data: {
        userId,
        name,
        email,
        smtpHost,
        smtpPort: Number(smtpPort),
        smtpUser,
        smtpPass,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Sender created successfully",
      data: sender,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSenders(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const senders = await prisma.sender.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: senders,
    });
  } catch (error) {
    next(error);
  }
}