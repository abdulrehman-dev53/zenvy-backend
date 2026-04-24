import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
// ================================
// USERS MANAGEMENT
// ================================
// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Block user (customer or seller)
export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.isBlocked = true; // add this field in schema
    await user.save();
    res.status(200).json({ success: true, message: "User blocked successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isBlocked = false;
    await user.save();

    res.status(200).json({ success: true, message: "User unblocked successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ================================
// SELLERS MANAGEMENT
// ================================
// Get all pending sellers
export const getPendingSellers = async (req, res) => {
  try {
    const pendingsellers = await User.find({ role: "seller", isSellerApproved: false }).select("-password");
    res.status(200).json({ success: true, data: pendingsellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Approve seller
export const approveSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);
    if (!seller || seller.role !== "seller") return res.status(404).json({ success: false, message: "Seller not found" });
    seller.isSellerApproved = true;
    await seller.save();
    res.status(200).json({ success: true, message: "Seller approved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Block seller
export const blockSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);
    if (!seller || seller.role !== "seller") return res.status(404).json({ success: false, message: "Seller not found" });

    seller.isSellerApproved = false;
    await seller.save();

    res.status(200).json({ success: true, message: "Seller blocked successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ================================
// PRODUCTS MANAGEMENT
// ================================
// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("user", "name email role");
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    Object.assign(product, req.body); // update fields dynamically
    await product.save();
    res.status(200).json({ success: true, message: "Product updated successfully", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    await product.remove();
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================
// ORDERS MANAGEMENT
// ================================

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").populate("orderItems.product", "name price");
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const { status } = req.body;
    order.status = status; // pending / shipped / delivered / cancelled
    await order.save();

    res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================
// DASHBOARD STATS
// ================================

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalPendingSellers = await User.countDocuments({ role: "seller", isSellerApproved: false });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenueAgg = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalSellers,
        totalPendingSellers,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};