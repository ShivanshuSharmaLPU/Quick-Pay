import { verifyToken } from '../utils/generateToken.js';
import logger from '../utils/logger.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches userId to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
   
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is missing or invalid'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
      next();
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export default authMiddleware;
