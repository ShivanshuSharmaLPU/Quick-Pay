import { z } from 'zod';

export const sendMoneySchema = z.object({
  receiverEmail: z.string().min(1, "Receiver email or UPI ID is required"),
  amount: z.number().positive("Amount must be positive").max(100000, "Amount exceeds maximum limit"),
  walletPin: z.string().length(4, "Wallet PIN must be 4 digits").regex(/^\d+$/, "PIN must contain only digits"),
  description: z.string().optional()
});

export const getTransactionsSchema = z.object({
  type: z.enum(['SEND', 'RECEIVE', 'ALL']).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'ALL']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});
