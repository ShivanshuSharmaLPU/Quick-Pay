import apiClient from './apiClient';
import { API_ENDPOINTS } from '../utils/constants';
import { ApiResponse, MoneyRequest, CreateRequestData, AcceptRequestData, PaginatedResponse } from '../types';

interface RequestFilters {
  status?: 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  page?: number;
  limit?: number;
}

export const requestApi = {
  /**
   * Create a money request
   */
  createRequest: async (data: CreateRequestData): Promise<ApiResponse<{ request: MoneyRequest }>> => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_REQUEST, data);
    return response.data;
  },

  /**
   * Get received requests (requests from others to me)
   */
  getReceivedRequests: async (filters?: RequestFilters): Promise<ApiResponse<PaginatedResponse<MoneyRequest>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get(`${API_ENDPOINTS.RECEIVED_REQUESTS}?${params.toString()}`);
    return response.data;
  },

  /**
   * Get sent requests (my requests to others)
   */
  getSentRequests: async (filters?: RequestFilters): Promise<ApiResponse<PaginatedResponse<MoneyRequest>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get(`${API_ENDPOINTS.SENT_REQUESTS}?${params.toString()}`);
    return response.data;
  },

  /**
   * Get request by ID
   */
  getRequestById: async (id: number): Promise<ApiResponse<{ request: MoneyRequest }>> => {
    const response = await apiClient.get(API_ENDPOINTS.REQUEST_BY_ID(id));
    return response.data;
  },

  /**
   * Accept a request
   */
  acceptRequest: async (id: number, data: AcceptRequestData): Promise<ApiResponse<{ transaction: any; request: MoneyRequest }>> => {
    const response = await apiClient.post(API_ENDPOINTS.ACCEPT_REQUEST(id), data);
    return response.data;
  },

  /**
   * Reject a request
   */
  rejectRequest: async (id: number): Promise<ApiResponse<{ request: MoneyRequest }>> => {
    const response = await apiClient.post(API_ENDPOINTS.REJECT_REQUEST(id));
    return response.data;
  },

  /**
   * Cancel a request
   */
  cancelRequest: async (id: number): Promise<ApiResponse<{ request: MoneyRequest }>> => {
    const response = await apiClient.post(API_ENDPOINTS.CANCEL_REQUEST(id));
    return response.data;
  }
};
