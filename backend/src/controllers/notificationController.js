import notificationService from '../services/notificationService.js';
import logger from '../utils/logger.js';

class NotificationController {
  /**
   * Get all notifications
   */
  async getNotifications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await notificationService.getNotifications(req.userId, page, limit);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get notifications controller error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notifications'
      });
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;

      const notification = await notificationService.markAsRead(parseInt(id), req.userId);

      res.status(200).json({
        success: true,
        data: { notification }
      });
    } catch (error) {
      logger.error('Mark as read controller error', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Notification not found'
      });
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req, res) {
    try {
      await notificationService.markAllAsRead(req.userId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      logger.error('Mark all as read controller error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all as read'
      });
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(req, res) {
    try {
      const result = await notificationService.getUnreadCount(req.userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get unread count controller error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count'
      });
    }
  }
}

export default new NotificationController();
