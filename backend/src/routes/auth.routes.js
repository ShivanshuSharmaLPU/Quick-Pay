import express from 'express';
import authController from '../controllers/authController.js';
import { validate } from '../middlewares/validation.js';
import { signupSchema, signinSchema } from '../schemas/authSchemas.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import authMiddleware from '../middlewares/authMiddleWare.js';

const router = express.Router();

// Signup
router.post('/signup', authLimiter, validate(signupSchema), authController.signup);

// Signin
router.post('/signin', authLimiter, validate(signinSchema), authController.signin);

// Get profile (protected)
router.get('/profile', authMiddleware, authController.getProfile);

export default router;
