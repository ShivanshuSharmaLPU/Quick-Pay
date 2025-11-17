import apiClient from './apiClient';
import { API_ENDPOINTS } from '../utils/constants';
import { SignupData, SigninData, ApiResponse, AuthResponse, User } from '../types';

export const authApi = {
  /**
   * Sign up a new user
   */
  signup: async (data: SignupData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.SIGNUP, data);
    return response.data;
  },

  /**
   * Sign in existing user
   */
  signin: async (data: SigninData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.SIGNIN, data);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE);
    return response.data;
  }
};
