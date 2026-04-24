import Product from "../models/productModel.js";

// ═══════════════════════════════════════════════════════
// 🌐 PUBLIC — GET ALL PRODUCTS (Customer View)
// ═══════════════════════════════════════════════════════
export const getProducts = async (req, res) => {
  try {
    const { category, search, onSale } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (onSale === "true") filter.isOnSale = true;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// 🌐 PUBLIC — GET SINGLE PRODUCT (with reviews)
// ═══════════════════════════════════════════════════════
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("user", "name email role")
      .populate("reviews.user", "name");

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// 🏪 SELLER — GET MY OWN PRODUCTS ONLY
// ═══════════════════════════════════════════════════════
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// ➕ CREATE PRODUCT (SELLER / ADMIN)
// ═══════════════════════════════════════════════════════
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, countInStock, salePrice, isOnSale } = req.body;
    const isAdmin = req.user.role === "admin";

    const product = await Product.create({
      name,
      description,
      price,
      image,
      category,
      countInStock,
      salePrice: salePrice || null,
      isOnSale: isOnSale || false,
      user: req.user._id,
      addedBy: isAdmin ? "Zenvy" : req.user.name,
      addedByAdmin: isAdmin,
    });

    res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// ✏️ UPDATE PRODUCT (OWNER / ADMIN)
// ═══════════════════════════════════════════════════════
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (req.user.role !== "admin" && product.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    const allowed = ["name", "description", "price", "image", "category", "countInStock", "salePrice", "isOnSale"];
    allowed.forEach((f) => { if (req.body[f] !== undefined) product[f] = req.body[f]; });

    // Agar salePrice 0 ya null ho toh sale hata do
    if (!req.body.salePrice || req.body.salePrice <= 0) {
      product.salePrice = null;
      product.isOnSale = false;
    }

    const updated = await product.save();
    res.json({ success: true, message: "Product updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// 🔥 TOGGLE SALE (OWNER / ADMIN)
// ═══════════════════════════════════════════════════════
export const toggleSale = async (req, res) => {
  try {
    const { salePrice } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (req.user.role !== "admin" && product.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    if (salePrice && Number(salePrice) > 0 && Number(salePrice) < product.price) {
      product.salePrice = Number(salePrice);
      product.isOnSale = true;
    } else {
      product.salePrice = null;
      product.isOnSale = false;
    }

    const updated = await product.save();
    res.json({
      success: true,
      message: product.isOnSale ? "Sale activated" : "Sale removed",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// 📦 ADD STOCK (OWNER / ADMIN)
// ═══════════════════════════════════════════════════════
export const addStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0)
      return res.status(400).json({ success: false, message: "Valid quantity required" });

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (req.user.role !== "admin" && product.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    product.countInStock += Number(quantity);
    const updated = await product.save();

    res.json({ success: true, message: `Stock updated. New: ${updated.countInStock}`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// 🗑️ DELETE PRODUCT
// SELLER  → sirf apna product
// ADMIN   → kisi bhi seller ka ya apna product
// ═══════════════════════════════════════════════════════
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    // ✅ Admin kisi ka bhi delete kar sakta hai
    if (req.user.role === "admin") {
      await Product.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: "Product deleted by admin" });
    }

    // Seller sirf apna delete kar sakta hai
    if (product.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// ⭐ CREATE / UPDATE REVIEW (Logged in user)
// Ek user ek product ko sirf ek baar review kar sakta hai
// ═══════════════════════════════════════════════════════
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment)
      return res.status(400).json({ success: false, message: "Rating and comment required" });

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    // Check: already reviewed?
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed)
      return res.status(400).json({ success: false, message: "You have already reviewed this product" });

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    // Recalculate average rating
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: "Review added", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// 🗑️ DELETE REVIEW
// User apna review delete kar sakta hai
// Admin koi bhi review delete kar sakta hai
// ═══════════════════════════════════════════════════════
export const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === req.params.reviewId
    );
    if (reviewIndex === -1)
      return res.status(404).json({ success: false, message: "Review not found" });

    const review = product.reviews[reviewIndex];

    // Only owner or admin can delete
    if (req.user.role !== "admin" && review.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    product.reviews.splice(reviewIndex, 1);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.length
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : 0;

    await product.save();
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════
// 📊 ADMIN — GET ALL PRODUCTS (all sellers)
// ═══════════════════════════════════════════════════════
export const adminGetAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
