import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleWare.js';

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// Search users
router.get('/search', userController.searchUsers);

// Check if user exists
router.get('/check', userController.checkUser);

// Get user profile
router.get('/profile', userController.getProfile);

// Get user balance
router.get('/balance', userController.getBalance);

export default router;
