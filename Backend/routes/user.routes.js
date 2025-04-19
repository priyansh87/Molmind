import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUser,
  deleteUser,
  getAllUsers
} from '../controllers/user.controllers.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ✅ Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// 🔐 Protected Routes (user should be logged in)
router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUser);
router.delete('/me', protect, deleteUser);

// 🧑‍💼 Admin-style route (can later add admin check middleware)
router.get('/all', getAllUsers);

export default router;
