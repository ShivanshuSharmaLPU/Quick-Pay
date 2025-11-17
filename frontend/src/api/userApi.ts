import apiClient from './apiClient';
import { API_ENDPOINTS } from '../utils/constants';
import { ApiResponse, UserSearchResult, User } from '../types';

export const userApi = {
  /**
   * Search users
   */
  searchUsers: async (query: string): Promise<ApiResponse<{ users: UserSearchResult[] }>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.USER_SEARCH}?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  /**
   * Check if user exists
   */
  checkUser: async (email: string): Promise<ApiResponse<{ user: UserSearchResult }>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.USER_CHECK}?userEmail=${encodeURIComponent(email)}`);
    return response.data;
  },

  /**
   * Get user balance
   */
  getBalance: async (): Promise<ApiResponse<{ balance: string }>> => {
    const response = await apiClient.get(API_ENDPOINTS.USER_BALANCE);
    return response.data;
  },

  /**
   * Get user profile
   */
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.get(API_ENDPOINTS.USER_PROFILE);
    return response.data;
  }
};
