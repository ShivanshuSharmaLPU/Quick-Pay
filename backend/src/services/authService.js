import prisma from '../db/index.js';
import { hashPassword, comparePassword, hashPin } from '../utils/hashPassword.js';
import { generateAccessToken } from '../utils/generateToken.js';
import { sanitizeUser } from '../utils/validators.js';
import logger from '../utils/logger.js';

class AuthService {
  /**
   * Register a new user
   */
  async signup(userData) {
    try {
      const { firstName, lastName, email, password, walletPin } = userData;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash password and PIN
      const hashedPassword = await hashPassword(password);
      const hashedPin = await hashPin(walletPin);

      // Generate UPI ID
      const upiId = `${email.split('@')[0]}@flexpay`;

      // Create user with initial random balance
      const randomBalance = Math.floor(Math.random() * 10000) + 1000; // ₹1000 - ₹11000

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          walletPin: hashedPin,
          upiId,
          balance: randomBalance
        }
      });

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      // Generate token
      const token = generateAccessToken(user.id);

      return {
        user: sanitizeUser(user),
        token
      };
    } catch (error) {
      logger.error('Signup error', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async signin(email, password) {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      logger.info('User signed in successfully', { userId: user.id, email: user.email });

      // Generate token
      const token = generateAccessToken(user.id);

      return {
        user: sanitizeUser(user),
        token
      };
    } catch (error) {
      logger.error('Signin error', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return sanitizeUser(user);
    } catch (error) {
      logger.error('Get user error', error);
      throw error;
    }
  }
}

export default new AuthService();
