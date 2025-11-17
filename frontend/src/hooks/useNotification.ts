import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  setNotifications, 
  markAsRead as markAsReadAction, 
  markAllAsRead as markAllAsReadAction, 
  setUnreadCount, 
  setLoading, 
  setError 
} from '../store/slices/notificationSlice';
import { notificationApi } from '../api/notificationApi';
import toast from 'react-hot-toast';

export const useNotification = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading, error } = 
    useSelector((state: RootState) => state.notification);

  const fetchNotifications = async (page = 1, limit = 20) => {
    try {
      dispatch(setLoading(true));
      const response = await notificationApi.getNotifications(page, limit);
      
      if (response.success && response.data) {
        dispatch(setNotifications(response.data.data));
        dispatch(setUnreadCount(response.data.unreadCount));
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch notifications';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      
      if (response.success && response.data) {
        dispatch(setUnreadCount(response.data.unreadCount));
      }
    } catch (err: any) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await notificationApi.markAsRead(id);
      
      if (response.success) {
        dispatch(markAsReadAction(id));
      }
    } catch (err: any) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationApi.markAllAsRead();
      
      if (response.success) {
        dispatch(markAllAsReadAction());
        toast.success('All notifications marked as read');
      }
    } catch (err: any) {
      toast.error('Failed to mark all as read');
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  };
};
