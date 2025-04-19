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


router.post('/register', registerUser);
router.post('/login', loginUser);


router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUser);
router.delete('/me', protect, deleteUser);

router.get('/all', getAllUsers);

export default router;
