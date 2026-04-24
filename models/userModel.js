import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔥 Important for security
    },

    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },

    // 🔹 Seller approval
    isSellerApproved: {
      type: Boolean,
      default: false,
    },

    // 🔴 User block field
    isBlocked: {
      type: Boolean,
      default: false, // by default user blocked nahi hoga
    },

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);