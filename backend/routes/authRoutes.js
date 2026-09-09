import express from "express";

import {
  register,
  login,
  verifyLoginOtp
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/verify-login-otp", verifyLoginOtp);
router.get("/me", protect, (req, res) => res.json({ user: req.user }));
router.post("/logout", (req, res) => {
  res.clearCookie("agri_token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/" });
  res.json({ message: "Logged out" });
});

export default router;
