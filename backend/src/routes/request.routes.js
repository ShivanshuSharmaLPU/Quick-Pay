import express from 'express';
import requestController from '../controllers/requestController.js';
import authMiddleware from '../middlewares/authMiddleWare.js';
import { validate, validateQuery } from '../middlewares/validation.js';
import { createRequestSchema, acceptRequestSchema, getRequestsSchema } from '../schemas/requestSchemas.js';
import { transactionLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// All request routes require authentication
router.use(authMiddleware);

// Create money request
router.post('/', transactionLimiter, validate(createRequestSchema), requestController.createRequest);

// Get received requests (requests from others to me)
router.get('/received', validateQuery(getRequestsSchema), requestController.getReceivedRequests);

// Get sent requests (my requests to others)
router.get('/sent', validateQuery(getRequestsSchema), requestController.getSentRequests);

// Get request by ID
router.get('/:id', requestController.getRequestById);

// Accept request
router.post('/:id/accept', transactionLimiter, validate(acceptRequestSchema), requestController.acceptRequest);

// Reject request
router.post('/:id/reject', requestController.rejectRequest);

// Cancel request
router.post('/:id/cancel', requestController.cancelRequest);

export default router;
