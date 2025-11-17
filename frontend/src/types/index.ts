// User Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  upiId: string;
  balance: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSearchResult {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  upiId: string;
}

// Transaction Types
export enum TransactionType {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface Transaction {
  id: number;
  senderId: number;
  receiverId: number;
  amount: string;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
  sender: UserSearchResult;
  receiver: UserSearchResult;
}

// Money Request Types
export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface MoneyRequest {
  id: number;
  requesterId: number;
  requestedFromId: number;
  amount: string;
  message?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  requester: UserSearchResult;
  requestedFrom: UserSearchResult;
}

// Notification Types
export enum NotificationType {
  TRANSACTION_SENT = 'TRANSACTION_SENT',
  TRANSACTION_RECEIVED = 'TRANSACTION_RECEIVED',
  REQUEST_RECEIVED = 'REQUEST_RECEIVED',
  REQUEST_ACCEPTED = 'REQUEST_ACCEPTED',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
  REQUEST_CANCELLED = 'REQUEST_CANCELLED'
}

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: number;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Auth Types
export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  walletPin: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Transaction Form Types
export interface SendMoneyData {
  receiverEmail: string;
  amount: number;
  walletPin: string;
  description?: string;
}

// Request Form Types
export interface CreateRequestData {
  requestedFromEmail: string;
  amount: number;
  message?: string;
}

export interface AcceptRequestData {
  walletPin: string;
}
