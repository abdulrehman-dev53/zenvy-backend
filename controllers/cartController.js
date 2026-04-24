import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, cartItems: [], totalPrice: 0 });
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.cartItems[itemIndex].quantity += quantity;
    } else {
      cart.cartItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        seller: product.user, // ✅ BAS YAHI ADD HUA
      });
    }

    cart.totalPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity, 0
    );

    await cart.save();
    res.json({ success: true, message: "Item added to cart", data: cart });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REMOVE ITEM FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    cart.cartItems = cart.cartItems.filter((item) => item.product.toString() !== productId);
    cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    await cart.save();
    res.json({ success: true, message: "Item removed", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    cart.cartItems = [];
    cart.totalPrice = 0;
    await cart.save();
    res.json({ success: true, message: "Cart cleared", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET USER CART
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("cartItems.product", "name price image");

    if (!cart) {
      return res.json({
        success: true,
        data: { cartItems: [], totalPrice: 0 },
      });
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};