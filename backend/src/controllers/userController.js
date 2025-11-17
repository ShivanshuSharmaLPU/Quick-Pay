import userService from '../services/userService.js';
import logger from '../utils/logger.js';

class UserController {
  /**
   * Search users
   */
  async searchUsers(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
      }

      const users = await userService.searchUsers(q.trim(), req.userId);

      res.status(200).json({
        success: true,
        data: { users }
      });
    } catch (error) {
      logger.error('Search users controller error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search users'
      });
    }
  }

  /**
   * Check if user exists
   */
  async checkUser(req, res) {
    try {
      const { userEmail } = req.query;

      if (!userEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email or UPI ID is required'
        });
      }

      const user = await userService.checkUserExists(userEmail);

      if (user) {
        res.status(200).json({
          success: true,
          message: 'User exists',
          data: { user }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (error) {
      logger.error('Check user controller error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check user'
      });
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      const user = await userService.getUserProfile(req.userId);

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error('Get profile controller error', error);
      res.status(404).json({
        success: false,
        message: error.message || 'User not found'
      });
    }
  }

  /**
   * Get user balance
   */
  async getBalance(req, res) {
    try {
      const balance = await userService.getUserBalance(req.userId);

      res.status(200).json({
        success: true,
        data: balance
      });
    } catch (error) {
      logger.error('Get balance controller error', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Failed to get balance'
      });
    }
  }
}

export default new UserController();
