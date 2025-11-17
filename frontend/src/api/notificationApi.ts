import apiClient from './apiClient';
import { API_ENDPOINTS } from '../utils/constants';
import { ApiResponse, Notification, PaginatedResponse } from '../types';

export const notificationApi = {
  /**
   * Get all notifications
   */
  getNotifications: async (page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Notification> & { unreadCount: number }>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS}?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
    const response = await apiClient.get(API_ENDPOINTS.UNREAD_COUNT);
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: number): Promise<ApiResponse<{ notification: Notification }>> => {
    const response = await apiClient.put(API_ENDPOINTS.MARK_AS_READ(id));
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.put(API_ENDPOINTS.MARK_ALL_READ);
    return response.data;
  }
};
