import apiClient from './apiClient';
import { API_ENDPOINTS } from '../utils/constants';
import { ApiResponse, Transaction, SendMoneyData, PaginatedResponse } from '../types';

interface TransactionFilters {
  type?: 'ALL' | 'SEND' | 'RECEIVE';
  status?: 'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export const transactionApi = {
  /**
   * Send money to another user
   */
  sendMoney: async (data: SendMoneyData): Promise<ApiResponse<{ transaction: Transaction }>> => {
    const response = await apiClient.post(API_ENDPOINTS.SEND_MONEY, data);
    return response.data;
  },

  /**
   * Get all transactions with filters
   */
  getTransactions: async (filters?: TransactionFilters): Promise<ApiResponse<PaginatedResponse<Transaction>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get(`${API_ENDPOINTS.TRANSACTIONS}?${params.toString()}`);
    return response.data;
  },

  /**
   * Get transaction by ID
   */
  getTransactionById: async (id: number): Promise<ApiResponse<{ transaction: Transaction }>> => {
    const response = await apiClient.get(API_ENDPOINTS.TRANSACTION_BY_ID(id));
    return response.data;
  },

  /**
   * Get transaction summary
   */
  getTransactionSummary: async (): Promise<ApiResponse<{
    totalSent: string;
    totalReceived: string;
    transactionCount: number;
  }>> => {
    const response = await apiClient.get(API_ENDPOINTS.TRANSACTION_SUMMARY);
    return response.data;
  }
};
