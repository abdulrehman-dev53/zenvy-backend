import express from "express";
import {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addStock,
  toggleSale,
  createReview,
  deleteReview,
  adminGetAllProducts,
} from "../controllers/productController.js";
import {
  protect,
  adminMiddleware,
  sellerApprovedOnly,
  adminPanelMiddleware,
} from "../middleware/authmiddleware.js";
import upload from "../middleware/upload.js"; // ✅ Cloudinary

const router = express.Router();

// ═══════════════════════════════════════════════════════
// 🔓 PUBLIC ROUTES
// ═══════════════════════════════════════════════════════
router.get("/", getProducts);
router.get("/:id", getProductById);

// ═══════════════════════════════════════════════════════
// 🔐 SELLER / ADMIN ROUTES
// ═══════════════════════════════════════════════════════

// Seller: apne products
router.get(
  "/seller/my-products",
  protect,
  adminMiddleware("admin", "seller"),
  sellerApprovedOnly,
  getMyProducts
);

// ✅ Create product — images ke saath
router.post(
  "/",
  protect,
  adminMiddleware("admin", "seller"),
  sellerApprovedOnly,
  upload.array("images", 5),
  createProduct
);

// ✅ Update product — images bhi update ho sakti hain
router.put(
  "/:id",
  protect,
  adminMiddleware("admin", "seller"),
  sellerApprovedOnly,
  upload.array("images", 5),
  updateProduct
);

// Toggle sale
router.put(
  "/:id/toggle-sale",
  protect,
  adminMiddleware("admin", "seller"),
  sellerApprovedOnly,
  toggleSale
);

// Add stock
router.put(
  "/:id/add-stock",
  protect,
  adminMiddleware("admin", "seller"),
  sellerApprovedOnly,
  addStock
);

// Delete product
router.delete(
  "/:id",
  protect,
  adminMiddleware("admin", "seller"),
  sellerApprovedOnly,
  deleteProduct
);

// ═══════════════════════════════════════════════════════
// ⭐ REVIEW ROUTES
// ═══════════════════════════════════════════════════════
router.post("/:id/reviews", protect, createReview);
router.delete("/:id/reviews/:reviewId", protect, deleteReview);

// ═══════════════════════════════════════════════════════
// 👑 ADMIN ONLY
// ═══════════════════════════════════════════════════════
router.get(
  "/admin/all-products",
  protect,
  adminPanelMiddleware,
  adminGetAllProducts
);

export default router;