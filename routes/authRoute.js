import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  dashboardController
} from "../controllers/authController.js";

import { protect, adminMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

// ================= PUBLIC ROUTES =================
router.post("/register", registerUser);   // POST /api/auth/register
router.post("/login", loginUser);         // POST /api/auth/login

// ================= PROTECTED ROUTES =================

// Any logged-in user
router.get(
  "/profile",
  protect,
  getUserProfile
);

// Admin only
router.get(
  "/admin/profile",
  protect,
  adminMiddleware("admin"),
  getUserProfile
);

// Admin & Manager
router.get(
  "/dashboard",
  protect,
  adminMiddleware("admin", "manager"),
  dashboardController
);
export default router;