import prisma from '../db/index.js';
import { comparePin } from '../utils/hashPassword.js';
import { TRANSACTION_TYPE, TRANSACTION_STATUS } from '../config/constants.js';
import logger from '../utils/logger.js';
import notificationService from './notificationService.js';

class TransactionService {
  /**
   * Send money to another user
   */
  async sendMoney(senderId, receiverEmail, amount, walletPin, description = null) {
    try {
      // Get sender
      const sender = await prisma.user.findUnique({
        where: { id: senderId }
      });

      if (!sender) {
        throw new Error('Sender not found');
      }

      // Verify PIN
      const isPinValid = await comparePin(walletPin, sender.walletPin);
      if (!isPinValid) {
        throw new Error('Invalid wallet PIN');
      }

      // Check balance
      if (parseFloat(sender.balance) < amount) {
        throw new Error('Insufficient balance');
      }

      // Find receiver
      const receiver = await prisma.user.findFirst({
        where: {
          OR: [
            { email: receiverEmail },
            { upiId: receiverEmail }
          ]
        }
      });

      if (!receiver) {
        throw new Error('Receiver not found');
      }

      if (sender.id === receiver.id) {
        throw new Error('Cannot send money to yourself');
      }

      // Perform transaction
      const result = await prisma.$transaction(async (tx) => {
        // Deduct from sender
        const updatedSender = await tx.user.update({
          where: { id: senderId },
          data: { balance: { decrement: amount } }
        });
        
        logger.info('Sender balance updated', { 
          senderId, 
          oldBalance: sender.balance.toString(), 
          newBalance: updatedSender.balance.toString(),
          deducted: amount 
        });

        // Add to receiver
        const updatedReceiver = await tx.user.update({
          where: { id: receiver.id },
          data: { balance: { increment: amount } }
        });
        
        logger.info('Receiver balance updated', { 
          receiverId: receiver.id, 
          oldBalance: receiver.balance.toString(), 
          newBalance: updatedReceiver.balance.toString(),
          added: amount 
        });

        // Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            senderId,
            receiverId: receiver.id,
            amount,
            type: TRANSACTION_TYPE.SEND,
            status: TRANSACTION_STATUS.COMPLETED,
            description
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                upiId: true
              }
            },
            receiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                upiId: true
              }
            }
          }
        });

        return transaction;
      });

      // Send notifications
      await notificationService.createTransactionNotifications(result);

      logger.info('Money sent successfully', {
        transactionId: result.id,
        senderId,
        receiverId: receiver.id,
        amount
      });

      return result;
    } catch (error) {
      logger.error('Send money error', error);
      throw error;
    }
  }

  /**
   * Get all transactions for a user with filters
   */
  async getTransactions(userId, filters = {}) {
    try {
      const {
        type = 'ALL',
        status = 'ALL',
        page = 1,
        limit = 20,
        startDate,
        endDate
      } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const where = {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      };

      if (type !== 'ALL') {
        where.type = type;
      }

      if (status !== 'ALL') {
        where.status = status;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      // Get transactions
      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                upiId: true
              }
            },
            receiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                upiId: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.transaction.count({ where })
      ]);

      return {
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get transactions error', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId, userId) {
    try {
      const transaction = await prisma.transaction.findFirst({
        where: {
          id: transactionId,
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              upiId: true
            }
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              upiId: true
            }
          }
        }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;
    } catch (error) {
      logger.error('Get transaction error', error);
      throw error;
    }
  }

  /**
   * Get transaction summary
   */
  async getTransactionSummary(userId) {
    try {
      const [totalSent, totalReceived, transactionCount] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            senderId: userId,
            status: TRANSACTION_STATUS.COMPLETED
          },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: {
            receiverId: userId,
            status: TRANSACTION_STATUS.COMPLETED
          },
          _sum: { amount: true }
        }),
        prisma.transaction.count({
          where: {
            OR: [
              { senderId: userId },
              { receiverId: userId }
            ]
          }
        })
      ]);

      return {
        totalSent: totalSent._sum.amount || 0,
        totalReceived: totalReceived._sum.amount || 0,
        transactionCount
      };
    } catch (error) {
      logger.error('Get transaction summary error', error);
      throw error;
    }
  }
}

export default new TransactionService();
