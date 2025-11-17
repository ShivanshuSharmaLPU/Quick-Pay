import prisma from '../db/index.js';
import { comparePin } from '../utils/hashPassword.js';
import { REQUEST_STATUS, REQUEST_EXPIRY_DAYS } from '../config/constants.js';
import logger from '../utils/logger.js';
import notificationService from './notificationService.js';
import transactionService from './transactionService.js';

class RequestService {
  /**
   * Create a money request
   */
  async createRequest(requesterId, requestedFromEmail, amount, message = null) {
    try {
      // Get requester
      const requester = await prisma.user.findUnique({
        where: { id: requesterId }
      });

      if (!requester) {
        throw new Error('Requester not found');
      }

      // Find requested user
      const requestedFrom = await prisma.user.findFirst({
        where: {
          OR: [
            { email: requestedFromEmail },
            { upiId: requestedFromEmail }
          ]
        }
      });

      if (!requestedFrom) {
        throw new Error('User not found');
      }

      if (requester.id === requestedFrom.id) {
        throw new Error('Cannot request money from yourself');
      }

      // Set expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + REQUEST_EXPIRY_DAYS);

      // Create request
      const request = await prisma.moneyRequest.create({
        data: {
          requesterId,
          requestedFromId: requestedFrom.id,
          amount,
          message,
          status: REQUEST_STATUS.PENDING,
          expiresAt
        },
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              upiId: true
            }
          },
          requestedFrom: {
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

      // Create notification for requested user
      await notificationService.createRequestNotification(request, 'RECEIVED');

      logger.info('Money request created', {
        requestId: request.id,
        requesterId,
        requestedFromId: requestedFrom.id,
        amount
      });

      return request;
    } catch (error) {
      logger.error('Create request error', error);
      throw error;
    }
  }

  /**
   * Accept a money request
   */
  async acceptRequest(requestId, userId, walletPin) {
    try {
      // Get request
      const request = await prisma.moneyRequest.findUnique({
        where: { id: requestId },
        include: {
          requester: true,
          requestedFrom: true
        }
      });

      if (!request) {
        throw new Error('Request not found');
      }

      if (request.requestedFromId !== userId) {
        throw new Error('Unauthorized to accept this request');
      }

      if (request.status !== REQUEST_STATUS.PENDING) {
        throw new Error(`Request is already ${request.status.toLowerCase()}`);
      }

      // Check if expired
      if (request.expiresAt && new Date() > request.expiresAt) {
        await prisma.moneyRequest.update({
          where: { id: requestId },
          data: { status: REQUEST_STATUS.EXPIRED }
        });
        throw new Error('Request has expired');
      }

      // Verify PIN
      const isPinValid = await comparePin(walletPin, request.requestedFrom.walletPin);
      if (!isPinValid) {
        throw new Error('Invalid wallet PIN');
      }

      // Check balance
      if (parseFloat(request.requestedFrom.balance) < parseFloat(request.amount)) {
        throw new Error('Insufficient balance');
      }

      // Perform transaction with increased timeout
      const result = await prisma.$transaction(async (tx) => {
        // Deduct from payer
        await tx.user.update({
          where: { id: userId },
          data: { balance: { decrement: request.amount } }
        });

        // Add to requester
        await tx.user.update({
          where: { id: request.requesterId },
          data: { balance: { increment: request.amount } }
        });

        // Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            senderId: userId,
            receiverId: request.requesterId,
            amount: request.amount,
            type: 'SEND',
            status: 'COMPLETED',
            description: request.message || 'Payment for money request',
            requestId: request.id
          }
        });

        // Update request status
        await tx.moneyRequest.update({
          where: { id: requestId },
          data: { status: REQUEST_STATUS.ACCEPTED }
        });

        return { transaction };
      }, {
        maxWait: 10000, // Maximum wait time to acquire a connection (10 seconds)
        timeout: 15000, // Maximum time for the transaction (15 seconds)
      });

      // Fetch the complete data after transaction completes
      const [completeTransaction, updatedRequest] = await Promise.all([
        prisma.transaction.findUnique({
          where: { id: result.transaction.id },
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
        }),
        prisma.moneyRequest.findUnique({
          where: { id: requestId },
          include: {
            requester: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                upiId: true
              }
            },
            requestedFrom: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                upiId: true
              }
            }
          }
        })
      ]);

      const finalResult = {
        transaction: completeTransaction,
        request: updatedRequest
      };

      // Create notifications
      await notificationService.createRequestNotification(
        finalResult.request,
        'ACCEPTED',
        finalResult.transaction.id
      );

      logger.info('Money request accepted', {
        requestId,
        transactionId: finalResult.transaction.id,
        amount: request.amount
      });

      return finalResult;
    } catch (error) {
      logger.error('Accept request error', error);
      throw error;
    }
  }

  /**
   * Reject a money request
   */
  async rejectRequest(requestId, userId) {
    try {
      const request = await prisma.moneyRequest.findUnique({
        where: { id: requestId },
        include: {
          requester: true,
          requestedFrom: true
        }
      });

      if (!request) {
        throw new Error('Request not found');
      }

      if (request.requestedFromId !== userId) {
        throw new Error('Unauthorized to reject this request');
      }

      if (request.status !== REQUEST_STATUS.PENDING) {
        throw new Error(`Request is already ${request.status.toLowerCase()}`);
      }

      // Update status
      const updatedRequest = await prisma.moneyRequest.update({
        where: { id: requestId },
        data: { status: REQUEST_STATUS.REJECTED },
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              upiId: true
            }
          },
          requestedFrom: {
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

      // Create notification
      await notificationService.createRequestNotification(updatedRequest, 'REJECTED');

      logger.info('Money request rejected', { requestId, userId });

      return updatedRequest;
    } catch (error) {
      logger.error('Reject request error', error);
      throw error;
    }
  }

  /**
   * Cancel a money request (by requester)
   */
  async cancelRequest(requestId, userId) {
    try {
      const request = await prisma.moneyRequest.findUnique({
        where: { id: requestId }
      });

      if (!request) {
        throw new Error('Request not found');
      }

      if (request.requesterId !== userId) {
        throw new Error('Unauthorized to cancel this request');
      }

      if (request.status !== REQUEST_STATUS.PENDING) {
        throw new Error(`Request is already ${request.status.toLowerCase()}`);
      }

      // Update status
      const updatedRequest = await prisma.moneyRequest.update({
        where: { id: requestId },
        data: { status: REQUEST_STATUS.CANCELLED },
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              upiId: true
            }
          },
          requestedFrom: {
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

      logger.info('Money request cancelled', { requestId, userId });

      return updatedRequest;
    } catch (error) {
      logger.error('Cancel request error', error);
      throw error;
    }
  }

  /**
   * Get received requests (requests from others to me)
   */
  async getReceivedRequests(userId, filters = {}) {
    try {
      const { status = 'ALL', page = 1, limit = 20 } = filters;
      const skip = (page - 1) * limit;

      const where = {
        requestedFromId: userId
      };

      if (status !== 'ALL') {
        where.status = status;
      }

      const [requests, total] = await Promise.all([
        prisma.moneyRequest.findMany({
          where,
          include: {
            requester: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                upiId: true
              }
            },
            requestedFrom: {
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
        prisma.moneyRequest.count({ where })
      ]);

      return {
        data: requests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get received requests error', error);
      throw error;
    }
  }

  /**
   * Get sent requests (my requests to others)
   */
  async getSentRequests(userId, filters = {}) {
    try {
      const { status = 'ALL', page = 1, limit = 20 } = filters;
      const skip = (page - 1) * limit;

      const where = {
        requesterId: userId
      };

      if (status !== 'ALL') {
        where.status = status;
      }

      const [requests, total] = await Promise.all([
        prisma.moneyRequest.findMany({
          where,
          include: {
            requester: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                upiId: true
              }
            },
            requestedFrom: {
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
        prisma.moneyRequest.count({ where })
      ]);

      return {
        data: requests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get sent requests error', error);
      throw error;
    }
  }

  /**
   * Get request by ID
   */
  async getRequestById(requestId, userId) {
    try {
      const request = await prisma.moneyRequest.findFirst({
        where: {
          id: requestId,
          OR: [
            { requesterId: userId },
            { requestedFromId: userId }
          ]
        },
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              upiId: true
            }
          },
          requestedFrom: {
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

      if (!request) {
        throw new Error('Request not found');
      }

      return request;
    } catch (error) {
      logger.error('Get request error', error);
      throw error;
    }
  }
}

export default new RequestService();
