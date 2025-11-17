import { z } from 'zod';

export const createRequestSchema = z.object({
  requestedFromEmail: z.string().min(1, "Email or UPI ID is required"),
  amount: z.number().positive("Amount must be positive").max(100000, "Amount exceeds maximum limit"),
  message: z.string().max(200, "Message too long").optional()
});

export const acceptRequestSchema = z.object({
  walletPin: z.string().length(4, "Wallet PIN must be 4 digits").regex(/^\d+$/, "PIN must contain only digits")
});

export const getRequestsSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'ALL']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional()
});
