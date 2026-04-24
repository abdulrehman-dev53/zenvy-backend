import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js"; // ✅ ADD

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart || cart.cartItems.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress?.fullName || !shippingAddress?.address ||
        !shippingAddress?.city || !shippingAddress?.phone) {
      return res.status(400).json({ success: false, message: "Shipping address incomplete" });
    }

    // ✅ Har item ka product fetch karo — seller ID lene ke liye
    const orderItemsWithSeller = await Promise.all(
      cart.cartItems.map(async (item) => {
        const product = await Product.findById(item.product);
        return {
          product: item.product,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || "",
          seller: product?.user || null, // ✅ product.user = seller
        };
      })
    );

    const totalPrice = orderItemsWithSeller.reduce(
      (acc, item) => acc + item.price * item.quantity, 0
    );

    const order = await Order.create({
      user: req.user._id,
      orderItems: orderItemsWithSeller,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      totalPrice,
    });

    cart.cartItems = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({ success: true, message: "Order created", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET MY ORDERS (buyer)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL ORDERS (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET SELLER ORDERS — seller dashboard ke liye
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "orderItems.seller": req.user._id,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Sirf us seller ki items filter karo
    const sellerOrders = orders.map((order) => ({
      _id: order._id,
      buyer: order.user,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      isDelivered: order.isDelivered,
      orderItems: order.orderItems.filter(
        (item) => item.seller?.toString() === req.user._id.toString()
      ),
      myTotal: order.orderItems
        .filter((item) => item.seller?.toString() === req.user._id.toString())
        .reduce((acc, item) => acc + item.price * item.quantity, 0),
    }));

    res.json({ success: true, data: sellerOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};