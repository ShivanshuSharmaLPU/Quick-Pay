import authService from '../services/authService.js';
import logger from '../utils/logger.js';

class AuthController {
  /**
   * Handle user signup
   */
  async signup(req, res) {
    try {
      const result = await authService.signup(req.body);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result
      });
    } catch (error) {
      logger.error('Signup controller error', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Signup failed'
      });
    }
  }

  /**
   * Handle user signin
   */
  async signin(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.signin(email, password);

      res.status(200).json({
        success: true,
        message: 'Signed in successfully',
        data: result
      });
    } catch (error) {
      logger.error('Signin controller error', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Signin failed'
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      const user = await authService.getUserById(req.userId);

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
}

export default new AuthController();
