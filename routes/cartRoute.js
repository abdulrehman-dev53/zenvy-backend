import express from "express";
import { addToCart, removeFromCart, clearCart , getCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authmiddleware.js";
const router = express.Router();
// Get user cart
router.get("/", protect, getCart);
// Add item to cart
router.post("/add", protect, addToCart);
// Remove item from cart
router.post("/remove", protect, removeFromCart);
// Clear cart
router.post("/clear", protect, clearCart);
export default router;