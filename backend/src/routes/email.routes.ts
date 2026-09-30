import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { createScheduledEmail } from "../controllers/email.controller.js";

const router = Router();

router.use(authenticate);

router.post("/schedule", createScheduledEmail);

export default router;