import logger from '../utils/logger.js';

/**
 * Validation middleware factory
 * Creates a middleware that validates request data against a Zod schema
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate request body
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      logger.warn('Validation error', { error: error.errors });
      
      // Extract error messages
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
  };
};

/**
 * Query validation middleware factory
 * Creates a middleware that validates query parameters
 */
export const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      // Convert query params to proper types
      const queryData = { ...req.query };
      
      // Convert numeric strings to numbers
      Object.keys(queryData).forEach(key => {
        if (!isNaN(queryData[key]) && queryData[key] !== '') {
          queryData[key] = Number(queryData[key]);
        }
      });

      const validated = await schema.parseAsync(queryData);
      req.query = validated;
      next();
    } catch (error) {
      logger.warn('Query validation error', { error: error.errors });
      
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));

      res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors
      });
    }
  };
};
