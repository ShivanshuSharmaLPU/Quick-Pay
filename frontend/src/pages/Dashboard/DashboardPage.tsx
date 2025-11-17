import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hook';
import { useTransaction } from '../../hooks/useTransaction';
import { useRequest } from '../../hooks/useRequest';
import { useNotification } from '../../hooks/useNotification';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';
import { TransactionStatus, RequestStatus } from '../../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const transactions = useAppSelector((state) => state.transaction.transactions);
  const summary = useAppSelector((state) => state.transaction.summary);
  const receivedRequests = useAppSelector((state) => state.request.receivedRequests);
  const unreadCount = useAppSelector((state) => state.notification.unreadCount);

  const { loading: transactionsLoading, fetchTransactions, fetchSummary } = useTransaction();
  const { loading: requestsLoading, fetchReceivedRequests } = useRequest();
  const { fetchNotifications } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchTransactions({ limit: 5 }),
        fetchSummary(),
        fetchReceivedRequests({ status: RequestStatus.PENDING, limit: 5 }),
        fetchNotifications()
      ]);
    };
    
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only re-run when user ID changes

  const pendingRequests = receivedRequests.filter((r) => r.status === RequestStatus.PENDING);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your payments and transactions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-blue-100 text-sm mb-2">Current Balance</p>
                    <motion.h2
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="text-5xl font-bold"
                    >
                      {formatCurrency(Number(user.balance))}
                    </motion.h2>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                
                {summary && (
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                    <div>
                      <p className="text-blue-100 text-sm">Total Sent</p>
                      <p className="text-xl font-semibold">{formatCurrency(Number(summary.totalSent))}</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Total Received</p>
                      <p className="text-xl font-semibold">{formatCurrency(Number(summary.totalReceived))}</p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    onClick={() => navigate(ROUTES.SEND_MONEY)}
                    variant="primary"
                    fullWidth
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send
                  </Button>
                  <Button
                    onClick={() => navigate(ROUTES.REQUEST_MONEY)}
                    variant="secondary"
                    fullWidth
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    Request
                  </Button>
                  <Button
                    onClick={() => navigate(ROUTES.HISTORY)}
                    variant="outline"
                    fullWidth
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Recent Transactions</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(ROUTES.HISTORY)}
                  >
                    View All
                  </Button>
                </div>

                {transactionsLoading ? (
                  <Loading.Skeleton count={5} />
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => {
                      const isSent = transaction.senderId === user.id;
                      const otherUser = isSent ? transaction.receiver : transaction.sender;
                      
                      return (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isSent ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                            }`}>
                              {isSent ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {isSent ? 'Sent to' : 'Received from'} {otherUser.firstName} {otherUser.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDateTime(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              isSent ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {isSent ? '-' : '+'}{formatCurrency(transaction.amount)}
                            </p>
                            <Badge
                              variant={
                                transaction.status === TransactionStatus.COMPLETED ? 'success' :
                                transaction.status === TransactionStatus.FAILED ? 'danger' :
                                'warning'
                              }
                              size="sm"
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="primary" size="sm">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(ROUTES.NOTIFICATIONS)}
                >
                  View All Notifications
                </Button>
              </Card>
            </motion.div>

            {/* Pending Requests */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Pending Requests</h3>
                  {pendingRequests.length > 0 && (
                    <Badge variant="warning" size="sm">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </div>

                {requestsLoading ? (
                  <Loading.Skeleton count={3} />
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.slice(0, 3).map((request) => {
                      const isReceived = request.requestedFromId === user?.id;
                      const otherUser = isReceived ? request.requester : request.requestedFrom;
                      
                      return (
                        <div
                          key={request.id}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-800">
                              {isReceived ? 'From' : 'To'}: {otherUser.firstName} {otherUser.lastName}
                            </p>
                            <p className="text-sm font-semibold text-blue-600">
                              {formatCurrency(request.amount)}
                            </p>
                          </div>
                          {request.message && (
                            <p className="text-xs text-gray-600 mb-2">{request.message}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="mt-4"
                  onClick={() => navigate(ROUTES.REQUESTS)}
                >
                  Manage Requests
                </Button>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-blue-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                {summary && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Transactions</span>
                      <span className="font-semibold text-gray-800">{summary.totalTransactions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Volume</span>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(Number(summary.totalSent) + Number(summary.totalReceived))}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
