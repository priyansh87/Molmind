import { User } from '../models/user.model.js'; // adjust path as needed
import asyncHandler from 'express-async-handler'; // for cleaner try-catch
import jwt from 'jsonwebtoken';

// 📌 Register a new user

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
  
    // 🔍 Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }
  
    // 🚫 Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists.",
      });
    }
  
    // ✅ Create user
    const newUser = await User.create({ name, email, password });
  
    // 🔐 Generate token
    const token = newUser.generateAccessToken();
  
    // 🍪 Set cookie options
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };
  
    res
      .status(201)
      .cookie("token", token, options)
      .json({
        success: true,
        message: "User registered successfully.",
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          projects: newUser.projects,
        },
      });
  });



export const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // 🚫 Validate input
      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required.",
          success: false,
        });
      }
  
      const user = await User.findOne({ email }).populate('projects');
      if (!user) {
        return res.status(404).json({
          message: "User not found or incorrect email.",
          success: false,
        });
      }
  
      const isValidPassword = await user.isPasswordCorrect(password);
      if (!isValidPassword) {
        return res.status(401).json({
          message: "Invalid email/password.",
          success: false,
        });
      }
  
      const token = user.generateAccessToken();
  
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      };
  
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        projects: user.projects,
        createdAt: user.createdAt,
      };
  
      return res.cookie("token", token, options).json({
        message: `Welcome back ${user.name}`,
        success: true,
        user: userData,
        token
      });
    } catch (error) {
      console.error("🔥 Login Error:", error.message);
      return res.status(500).json({
        message: "Internal Server Error",
        success: false,
      });
    }
  };


// 🧾 Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userid).populate('projects');

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});


// ✏️ Update user details
export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userid);

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
    }

    const { name, password } = req.body;

    if (name) user.name = name;
    if (password) user.password = password;

    await user.save();

    res.status(200).json({
        success: true,
        message: "User updated successfully.",
    });
});


// ❌ Delete user
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userid);

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: "User deleted successfully.",
    });
});


// 🧑‍💼 Admin: Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').populate('projects');

    res.status(200).json({
        success: true,
        count: users.length,
        data: users,
    });
});
