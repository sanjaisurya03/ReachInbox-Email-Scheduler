import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createSender,
  getSenders,
} from "../controllers/sender.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createSender);
router.get("/", getSenders);

export default router;