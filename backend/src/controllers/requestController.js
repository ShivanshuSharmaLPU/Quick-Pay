import requestService from '../services/requestService.js';
import logger from '../utils/logger.js';

class RequestController {
  /**
   * Create money request
   */
  async createRequest(req, res) {
    try {
      const { requestedFromEmail, amount, message } = req.body;

      const request = await requestService.createRequest(
        req.userId,
        requestedFromEmail,
        amount,
        message
      );

      res.status(201).json({
        success: true,
        message: 'Money request created successfully',
        data: { request }
      });
    } catch (error) {
      logger.error('Create request controller error', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create request'
      });
    }
  }

  /**
   * Accept money request
   */
  async acceptRequest(req, res) {
    try {
      const { id } = req.params;
      const { walletPin } = req.body;

      const result = await requestService.acceptRequest(
        parseInt(id),
        req.userId,
        walletPin
      );

      res.status(200).json({
        success: true,
        message: 'Request accepted and payment completed',
        data: result
      });
    } catch (error) {
      logger.error('Accept request controller error', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to accept request'
      });
    }
  }

  /**
   * Reject money request
   */
  async rejectRequest(req, res) {
    try {
      const { id } = req.params;

      const request = await requestService.rejectRequest(parseInt(id), req.userId);

      res.status(200).json({
        success: true,
        message: 'Request rejected',
        data: { request }
      });
    } catch (error) {
      logger.error('Reject request controller error', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to reject request'
      });
    }
  }

  /**
   * Cancel money request
   */
  async cancelRequest(req, res) {
    try {
      const { id } = req.params;

      const request = await requestService.cancelRequest(parseInt(id), req.userId);

      res.status(200).json({
        success: true,
        message: 'Request cancelled',
        data: { request }
      });
    } catch (error) {
      logger.error('Cancel request controller error', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to cancel request'
      });
    }
  }

  /**
   * Get received requests
   */
  async getReceivedRequests(req, res) {
    try {
      const filters = {
        status: req.query.status || 'ALL',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await requestService.getReceivedRequests(req.userId, filters);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get received requests controller error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get received requests'
      });
    }
  }

  /**
   * Get sent requests
   */
  async getSentRequests(req, res) {
    try {
      const filters = {
        status: req.query.status || 'ALL',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await requestService.getSentRequests(req.userId, filters);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get sent requests controller error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get sent requests'
      });
    }
  }

  /**
   * Get request by ID
   */
  async getRequestById(req, res) {
    try {
      const { id } = req.params;

      const request = await requestService.getRequestById(parseInt(id), req.userId);

      res.status(200).json({
        success: true,
        data: { request }
      });
    } catch (error) {
      logger.error('Get request by ID controller error', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Request not found'
      });
    }
  }
}

export default new RequestController();
