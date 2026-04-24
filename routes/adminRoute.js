import express from "express";
import {
  getAllUsers,
  blockUser,
  unblockUser,
  getPendingSellers,
  approveSeller,
  blockSeller,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAdminStats
} from "../controllers/admincontroller.js";
import { protect,  adminPanelMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();


// ================================
// USERS MANAGEMENT
// ================================

// Get all users
router.get(
  "/users",
  protect,
  adminPanelMiddleware,
  getAllUsers
);

// Block user
router.put(
  "/user/:id/block",
  protect,
  adminPanelMiddleware,
  blockUser
);

// Unblock user
router.put(
  "/user/:id/unblock",
  protect,
  adminPanelMiddleware,
  unblockUser
);


// ================================
// SELLERS MANAGEMENT
// ================================

// Get pending sellers
router.get(
  "/sellers/pending",
  protect,
  adminPanelMiddleware,
  getPendingSellers
);

// Approve seller
router.put(
  "/seller/:id/approve",
  protect,
  adminPanelMiddleware,
  approveSeller
);

// Block seller
router.put(
  "/seller/:id/block",
  protect,
  adminPanelMiddleware,
  blockSeller
);


// ================================
// PRODUCTS MANAGEMENT
// ================================

// Get all products
router.get(
  "/products",
  protect,
  adminPanelMiddleware,
  getAllProducts
);

// Update product
router.put(
  "/product/:id",
  protect,
  adminPanelMiddleware,
  updateProduct
);

// Delete product
router.delete(
  "/product/:id",
  protect,
  adminPanelMiddleware,
  deleteProduct
);


// ================================
// ORDERS MANAGEMENT
// ================================

// Get all orders
router.get(
  "/orders",
  protect,
  adminPanelMiddleware,
  getAllOrders
);

// Update order status
router.put(
  "/order/:id/status",
  protect,
  adminPanelMiddleware,
  updateOrderStatus
);
// ================================
// DASHBOARD STATS
// ================================
router.get(
  "/stats",
  protect,
  adminPanelMiddleware,
  getAdminStats
);
export default router;