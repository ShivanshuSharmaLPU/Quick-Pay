import express from 'express';
import transactionController from '../controllers/transactionController.js';
import authMiddleware from '../middlewares/authMiddleWare.js';
import { validate, validateQuery } from '../middlewares/validation.js';
import { sendMoneySchema, getTransactionsSchema } from '../schemas/transactionSchemas.js';
import { transactionLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// All transaction routes require authentication
router.use(authMiddleware);

// Send money
router.post('/send', transactionLimiter, validate(sendMoneySchema), transactionController.sendMoney);

// Get all transactions with filters
router.get('/', validateQuery(getTransactionsSchema), transactionController.getTransactions);

// Get transaction summary
router.get('/summary', transactionController.getTransactionSummary);

// Get transaction by ID
router.get('/:id', transactionController.getTransactionById);

export default router;
