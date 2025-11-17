import prisma from '../db/index.js';
import { sanitizeUser } from '../utils/validators.js';
import logger from '../utils/logger.js';

class UserService {
  /**
   * Search users by name, email, or UPI ID
   */
  async searchUsers(query, currentUserId) {
    try {
      const users = await prisma.user.findMany({
        where: {
          AND: [
            {
              id: {
                not: currentUserId // Exclude current user
              }
            },
            {
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { upiId: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          upiId: true
        },
        take: 10
      });

      return users;
    } catch (error) {
      logger.error('Search users error', error);
      throw error;
    }
  }

  /**
   * Check if user exists by email or UPI ID
   */
  async checkUserExists(identifier) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { upiId: identifier }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          upiId: true
        }
      });

      return user;
    } catch (error) {
      logger.error('Check user exists error', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return sanitizeUser(user);
    } catch (error) {
      logger.error('Get user profile error', error);
      throw error;
    }
  }

  /**
   * Get user balance
   */
  async getUserBalance(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return { balance: user.balance };
    } catch (error) {
      logger.error('Get user balance error', error);
      throw error;
    }
  }
}

export default new UserService();
