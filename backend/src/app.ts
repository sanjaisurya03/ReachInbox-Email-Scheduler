import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import emailRoutes from "./routes/email.routes.js";
import slackRoutes from "./routes/slack.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import searchRoutes from "./routes/search.routes.js";

import { initializeEmailIndex } from "./services/elasticsearch.service.js";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;

// Security
app.use(helmet());

// CORS
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan("dev"));

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ReachInbox scheduler API is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/slack", slackRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/search", searchRoutes);

// Initialize Elasticsearch
initializeEmailIndex();

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});