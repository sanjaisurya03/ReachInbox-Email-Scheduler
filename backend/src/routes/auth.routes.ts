import { Router } from "express";
import passport from "passport";

import {
  register,
  login,
  googleCallback,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/google/failure",
  }),
  googleCallback
);

router.get("/google/failure", (_req, res) => {
  return res.status(401).json({
    success: false,
    message: "Google authentication failed",
  });
});

export default router;