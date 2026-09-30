import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import passport from "passport";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import "./config/passport.js";

import authRoutes from "./routes/auth.routes.js";
import emailRoutes from "./routes/email.routes.js";
import slackRoutes from "./routes/slack.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import senderRoutes from "./routes/sender.routes.js";
import searchRoutes from "./routes/search.routes.js";

import { initializeEmailIndex } from "./services/elasticsearch.service.js";
import { emailQueue } from "./queues/email.queue.js";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ReachInbox scheduler API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/slack", slackRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/senders", senderRoutes);
app.use("/api/search", searchRoutes);

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
  ],
  serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

async function startServer() {
  try {
    await initializeEmailIndex();

    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`);
      console.log(
        `BullMQ dashboard: http://localhost:${PORT}/admin/queues`
      );
      console.log(
        `Google OAuth: http://localhost:${PORT}/api/auth/google`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();