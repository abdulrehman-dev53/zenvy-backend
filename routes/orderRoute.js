import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  getSellerOrders, // ✅ ADD
} from "../controllers/orderController.js";
import { protect, adminMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/seller/myorders", protect, getSellerOrders); // ✅ ADD — /:id se PEHLE zaroori
router.get("/:id", protect, getOrderById);
router.get("/", protect, adminMiddleware, getAllOrders);

export default router;