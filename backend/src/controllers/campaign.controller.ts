import { Response, NextFunction } from "express";
import prisma from "../config/database.js";
import { emailQueue } from "../queues/email.queue.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export async function createCampaign(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    const {
      name,
      subject,
      body,
      startTime,
      delayMs,
      hourlyLimit,
    } = req.body;

    if (
      !userId ||
      !name ||
      !subject ||
      !body ||
      !startTime ||
      delayMs === undefined ||
      hourlyLimit === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All campaign fields are required",
      });
    }

    const parsedStartTime = new Date(startTime);

    if (isNaN(parsedStartTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startTime",
      });
    }

    const parsedDelayMs = Number(delayMs);
    const parsedHourlyLimit = Number(hourlyLimit);

    if (
      !Number.isFinite(parsedDelayMs) ||
      parsedDelayMs < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "delayMs must be a valid non-negative number",
      });
    }

    if (
      !Number.isFinite(parsedHourlyLimit) ||
      parsedHourlyLimit <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "hourlyLimit must be a valid positive number",
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name,
        subject,
        body,
        startTime: parsedStartTime,
        delayMs: parsedDelayMs,
        hourlyLimit: parsedHourlyLimit,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCampaigns(
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

    const campaigns = await prisma.campaign.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCampaignById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const campaignId = String(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId,
      },
      include: {
        emails: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCampaign(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const campaignId = String(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

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

    const {
      name,
      subject,
      body,
      startTime,
      delayMs,
      hourlyLimit,
    } = req.body;

    let parsedStartTime: Date | undefined;

    if (startTime !== undefined) {
      parsedStartTime = new Date(startTime);

      if (isNaN(parsedStartTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startTime",
        });
      }
    }

    let parsedDelayMs: number | undefined;

    if (delayMs !== undefined) {
      parsedDelayMs = Number(delayMs);

      if (
        !Number.isFinite(parsedDelayMs) ||
        parsedDelayMs < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "delayMs must be a valid non-negative number",
        });
      }
    }

    let parsedHourlyLimit: number | undefined;

    if (hourlyLimit !== undefined) {
      parsedHourlyLimit = Number(hourlyLimit);

      if (
        !Number.isFinite(parsedHourlyLimit) ||
        parsedHourlyLimit <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "hourlyLimit must be a valid positive number",
        });
      }
    }

    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(subject !== undefined && { subject }),
        ...(body !== undefined && { body }),
        ...(parsedStartTime !== undefined && {
          startTime: parsedStartTime,
        }),
        ...(parsedDelayMs !== undefined && {
          delayMs: parsedDelayMs,
        }),
        ...(parsedHourlyLimit !== undefined && {
          hourlyLimit: parsedHourlyLimit,
        }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      data: updatedCampaign,
    });
  } catch (error) {
    next(error);
  }
}

export async function pauseCampaign(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const campaignId = String(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId,
      },
      include: {
        emails: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (campaign.isPaused) {
      return res.status(400).json({
        success: false,
        message: "Campaign is already paused",
      });
    }

    for (const email of campaign.emails) {
      if (email.status === "SCHEDULED" && email.bullmqJobId) {
        try {
          const job = await emailQueue.getJob(email.bullmqJobId);

          if (job) {
            await job.remove();
          }
        } catch (error) {
          console.error(
            `Could not remove BullMQ job ${email.bullmqJobId}:`,
            error instanceof Error ? error.message : error
          );
        }
      }
    }

    await prisma.email.updateMany({
      where: {
        campaignId,
        status: "SCHEDULED",
      },
      data: {
        bullmqJobId: null,
      },
    });

    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        isPaused: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Campaign paused successfully",
      data: updatedCampaign,
    });
  } catch (error) {
    next(error);
  }
}

export async function resumeCampaign(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const campaignId = String(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId,
      },
      include: {
        emails: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (!campaign.isPaused) {
      return res.status(400).json({
        success: false,
        message: "Campaign is already active",
      });
    }

    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        isPaused: false,
      },
    });

    for (const email of campaign.emails) {
      if (email.status !== "SCHEDULED") {
        continue;
      }

      const delay = Math.max(
        email.scheduledAt.getTime() - Date.now(),
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

      await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          bullmqJobId: job.id,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Campaign resumed successfully",
      data: updatedCampaign,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCampaign(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const campaignId = String(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId,
      },
      include: {
        emails: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    for (const email of campaign.emails) {
      if (email.bullmqJobId) {
        try {
          const job = await emailQueue.getJob(email.bullmqJobId);

          if (job) {
            await job.remove();
          }
        } catch (error) {
          console.error(
            `Could not remove BullMQ job ${email.bullmqJobId}:`,
            error instanceof Error ? error.message : error
          );
        }
      }
    }

    await prisma.campaign.delete({
      where: {
        id: campaignId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Campaign and scheduled emails deleted successfully",
      deletedCampaignId: campaignId,
      deletedEmailCount: campaign.emails.length,
    });
  } catch (error) {
    next(error);
  }
}