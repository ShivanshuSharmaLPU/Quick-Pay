import express from 'express';
import notificationController from '../controllers/notificationController.js';
import authMiddleware from '../middlewares/authMiddleWare.js';

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

// Get all notifications
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all as read
router.put('/read-all', notificationController.markAllAsRead);

export default router;
