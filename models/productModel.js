import mongoose from "mongoose";

// ── Review Sub-Schema ────────────────────────────────────
const reviewSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// ── Product Schema ───────────────────────────────────────
const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },

    // 🔥 SALE
    salePrice: { type: Number, default: null },
    isOnSale: { type: Boolean, default: false },

    // ✅ Images (Cloudinary)
    image: { type: String, default: "" },          // pehli image (backward compat)
    images: [{ type: String }],                    // saari images array

    category: { type: String },
    countInStock: { type: Number, required: true, default: 0 },

    // 📦 SOLD COUNT
    soldCount: { type: Number, default: 0 },

    // 👤 Seller / Admin
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    addedBy: { type: String, default: "Zenvy" },
    addedByAdmin: { type: Boolean, default: false },

    // ⭐ REVIEWS
    reviews: [reviewSchema],
    numReviews: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;