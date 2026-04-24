import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Generate Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
// dashboard controller
export const dashboardController = async (req, res) => {
  res.status(200).json({
    success: true,
    message:  `Welcome to dashboard, ${req.user.name}`,
    role: req.user.role,
  });
};
//REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "customer", 
  // agar role na aaye to default
});

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSellerApproved: user.isSellerApproved,
        token: generateToken(user),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (user && (await bcrypt.compare(password, user.password))) {
      // ✅ Blocked user check
      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "Your account is blocked. Contact admin.",
        });
      }

      // ✅ Seller approval check
      if (user.role === "seller" && user.isSellerApproved === false) {
        return res.status(403).json({
          success: false,
          message: "Your seller account is blocked or not approved yet.",
        });
      }

      // ✅ If all checks pass → allow login
      res.json({
        success: true,
        message: "Login successful",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user),
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PROFILE (Protected)
export const getUserProfile = async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
};