import prisma from '../db/index.js';
import { NOTIFICATION_TYPE } from '../config/constants.js';
import logger from '../utils/logger.js';

class NotificationService {
  /**
   * Create notification
   */
  async createNotification(userId, type, title, message, relatedId = null) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          relatedId
        }
      });

      return notification;
    } catch (error) {
      logger.error('Create notification error', error);
      throw error;
    }
  }

  /**
   * Create notifications for transaction
   */
  async createTransactionNotifications(transaction) {
    try {
      const senderName = `${transaction.sender.firstName} ${transaction.sender.lastName}`;
      const receiverName = `${transaction.receiver.firstName} ${transaction.receiver.lastName}`;

      // Notification for sender
      await this.createNotification(
        transaction.senderId,
        NOTIFICATION_TYPE.TRANSACTION_SENT,
        'Money Sent',
        `You sent ₹${transaction.amount} to ${receiverName}`,
        transaction.id
      );

      // Notification for receiver
      await this.createNotification(
        transaction.receiverId,
        NOTIFICATION_TYPE.TRANSACTION_RECEIVED,
        'Money Received',
        `You received ₹${transaction.amount} from ${senderName}`,
        transaction.id
      );

      logger.info('Transaction notifications created', { transactionId: transaction.id });
    } catch (error) {
      logger.error('Create transaction notifications error', error);
    }
  }

  /**
   * Create notification for money request
   */
  async createRequestNotification(request, action, transactionId = null) {
    try {
      const requesterName = `${request.requester.firstName} ${request.requester.lastName}`;
      const requestedFromName = `${request.requestedFrom.firstName} ${request.requestedFrom.lastName}`;

      let userId, type, title, message;

      switch (action) {
        case 'RECEIVED':
          userId = request.requestedFromId;
          type = NOTIFICATION_TYPE.REQUEST_RECEIVED;
          title = 'Money Request Received';
          message = `${requesterName} requested ₹${request.amount}${request.message ? ` - ${request.message}` : ''}`;
          break;

        case 'ACCEPTED':
          userId = request.requesterId;
          type = NOTIFICATION_TYPE.REQUEST_ACCEPTED;
          title = 'Request Accepted';
          message = `${requestedFromName} accepted your request of ₹${request.amount}`;
          break;

        case 'REJECTED':
          userId = request.requesterId;
          type = NOTIFICATION_TYPE.REQUEST_REJECTED;
          title = 'Request Rejected';
          message = `${requestedFromName} rejected your request of ₹${request.amount}`;
          break;

        case 'CANCELLED':
          userId = request.requestedFromId;
          type = NOTIFICATION_TYPE.REQUEST_CANCELLED;
          title = 'Request Cancelled';
          message = `${requesterName} cancelled their request of ₹${request.amount}`;
          break;

        default:
          return;
      }

      await this.createNotification(
        userId,
        type,
        title,
        message,
        transactionId || request.id
      );

      logger.info('Request notification created', { requestId: request.id, action });
    } catch (error) {
      logger.error('Create request notification error', error);
    }
  }

  /**
   * Get user notifications
   */
  async getNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, isRead: false } })
      ]);

      return {
        data: notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get notifications error', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId
        }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });

      return updated;
    } catch (error) {
      logger.error('Mark notification as read error', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: { isRead: true }
      });

      logger.info('All notifications marked as read', { userId });
      return { success: true };
    } catch (error) {
      logger.error('Mark all as read error', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      });

      return { unreadCount: count };
    } catch (error) {
      logger.error('Get unread count error', error);
      throw error;
    }
  }
}

export default new NotificationService();
