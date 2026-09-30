import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";

import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  pauseCampaign,
  resumeCampaign,
  deleteCampaign,
} from "../controllers/campaign.controller.js";

import {
  addCampaignEmail,
  addBulkCampaignEmails,
} from "../controllers/campaign-email.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createCampaign);
router.get("/", getCampaigns);
router.get("/:id", getCampaignById);
router.put("/:id", updateCampaign);
router.post("/:id/pause", pauseCampaign);
router.post("/:id/resume", resumeCampaign);
router.post("/:id/emails", addCampaignEmail);
router.post("/:id/emails/bulk", addBulkCampaignEmails);
router.delete("/:id", deleteCampaign);

export default router;