import transactionService from '../services/transactionService.js';
import logger from '../utils/logger.js';

class TransactionController {
  /**
   * Send money
   */
  async sendMoney(req, res) {
    try {
      const { receiverEmail, amount, walletPin, description } = req.body;

      const transaction = await transactionService.sendMoney(
        req.userId,
        receiverEmail,
        amount,
        walletPin,
        description
      );

      res.status(200).json({
        success: true,
        message: 'Money sent successfully',
        data: { transaction }
      });
    } catch (error) {
      logger.error('Send money controller error', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to send money'
      });
    }
  }

  /**
   * Get all transactions
   */
  async getTransactions(req, res) {
    try {
      const filters = {
        type: req.query.type || 'ALL',
        status: req.query.status || 'ALL',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const result = await transactionService.getTransactions(req.userId, filters);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get transactions controller error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions'
      });
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(req, res) {
    try {
      const { id } = req.params;
      const transaction = await transactionService.getTransactionById(
        parseInt(id),
        req.userId
      );

      res.status(200).json({
        success: true,
        data: { transaction }
      });
    } catch (error) {
      logger.error('Get transaction by ID controller error', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Transaction not found'
      });
    }
  }

  /**
   * Get transaction summary
   */
  async getTransactionSummary(req, res) {
    try {
      const summary = await transactionService.getTransactionSummary(req.userId);

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      logger.error('Get transaction summary controller error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction summary'
      });
    }
  }
}

export default new TransactionController();
