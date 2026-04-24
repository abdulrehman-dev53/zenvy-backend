import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
// 🔒 AUTH MIDDLEWARE
export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // 🔹 attach user to request
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};
// 🔑 ROLE BASED ACCESS
export const adminMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) not allowed`,
      });
    }
    next();
  };
};
// 🔹 SELLER APPROVAL CHECK
export const sellerApprovedOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
  if (req.user.role === "seller" && req.user.isSellerApproved === false) {
    return res.status(403).json({
      success: false,
      message: "Seller not approved by admin",
    });
  }
  next();
};
// middleware/adminPanelMiddleware.js
export const adminPanelMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  // Strictly check backend admin role
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only admin panel admin can access this panel."
    });
  }
  next();
};