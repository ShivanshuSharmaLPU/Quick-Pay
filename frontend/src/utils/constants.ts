export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export const ROUTES = {
  HOME: '/',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  SEND_MONEY: '/send-money',
  REQUEST_MONEY: '/request-money',
  REQUESTS: '/requests',
  HISTORY: '/history',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications'
};

export const API_ENDPOINTS = {
  // Auth
  SIGNUP: '/auth/signup',
  SIGNIN: '/auth/signin',
  PROFILE: '/auth/profile',
  
  // User
  USER_SEARCH: '/user/search',
  USER_CHECK: '/user/check',
  USER_BALANCE: '/user/balance',
  USER_PROFILE: '/user/profile',
  
  // Transactions
  SEND_MONEY: '/transactions/send',
  TRANSACTIONS: '/transactions',
  TRANSACTION_BY_ID: (id: number) => `/transactions/${id}`,
  TRANSACTION_SUMMARY: '/transactions/summary',
  
  // Requests
  CREATE_REQUEST: '/requests',
  RECEIVED_REQUESTS: '/requests/received',
  SENT_REQUESTS: '/requests/sent',
  REQUEST_BY_ID: (id: number) => `/requests/${id}`,
  ACCEPT_REQUEST: (id: number) => `/requests/${id}/accept`,
  REJECT_REQUEST: (id: number) => `/requests/${id}/reject`,
  CANCEL_REQUEST: (id: number) => `/requests/${id}/cancel`,
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  UNREAD_COUNT: '/notifications/unread/count',
  MARK_AS_READ: (id: number) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all'
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData'
};

export const MAX_AMOUNT = 100000;
export const MIN_AMOUNT = 1;
