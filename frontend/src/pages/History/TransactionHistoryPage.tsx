import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTransaction } from '../../hooks/useTransaction';
import { useAppSelector } from '../../store/hook';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { Input } from '../../components/common/Input';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';
import { TransactionType, TransactionStatus } from '../../types';

export const TransactionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const transactions = useAppSelector((state) => state.transaction.transactions);
  const summary = useAppSelector((state) => state.transaction.summary);
  
  const { loading, fetchTransactions } = useTransaction();

  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchTransactions({
      type: typeFilter === 'ALL' ? undefined : typeFilter,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      limit: 50
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter]); // Only re-run when filters change, not when fetchTransactions changes

  const filteredTransactions = transactions.filter((transaction) => {
    // Search filter
    if (searchQuery) {
      const sender = `${transaction.sender.firstName} ${transaction.sender.lastName}`.toLowerCase();
      const receiver = `${transaction.receiver.firstName} ${transaction.receiver.lastName}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      
      if (!sender.includes(query) && !receiver.includes(query)) {
        return false;
      }
    }

    // Date range filter
    if (dateFrom) {
      const transactionDate = new Date(transaction.createdAt);
      const fromDate = new Date(dateFrom);
      if (transactionDate < fromDate) {
        return false;
      }
    }

    if (dateTo) {
      const transactionDate = new Date(transaction.createdAt);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (transactionDate > toDate) {
        return false;
      }
    }

    return true;
  });

  const getStatusBadgeVariant = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'warning';
      case TransactionStatus.COMPLETED:
        return 'success';
      case TransactionStatus.FAILED:
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleClearFilters = () => {
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Transaction History</h1>
          <p className="text-gray-600 mt-1">View and manage all your transactions</p>
        </motion.div>

        {/* Summary Cards */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Received</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalReceived)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Sent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary.totalSent)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.totalTransactions}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <Input
                  label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>

              {/* Date From */}
              <Input
                label="From Date"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />

              {/* Date To */}
              <Input
                label="To Date"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <div className="flex flex-wrap gap-2">
                {['ALL', TransactionType.SEND, TransactionType.RECEIVE].map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={typeFilter === type ? 'primary' : 'outline'}
                    onClick={() => setTypeFilter(type as TransactionType | 'ALL')}
                  >
                    {type === 'ALL' ? 'All Types' : type === TransactionType.SEND ? 'Sent' : 'Received'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {['ALL', TransactionStatus.PENDING, TransactionStatus.COMPLETED, TransactionStatus.FAILED].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={statusFilter === status ? 'primary' : 'outline'}
                    onClick={() => setStatusFilter(status as TransactionStatus | 'ALL')}
                  >
                    {status === 'ALL' ? 'All Status' : status.charAt(0) + status.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
            >
              Clear All Filters
            </Button>
          </Card>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Transactions ({filteredTransactions.length})
              </h3>
            </div>

            {loading ? (
              <Loading.Skeleton count={5} />
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 text-lg mb-2">No transactions found</p>
                <p className="text-gray-500 text-sm">
                  {searchQuery || dateFrom || dateTo || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'Try adjusting your filters'
                    : "You haven't made any transactions yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => {
                  const isSent = transaction.senderId === user?.id;
                  const otherUser = isSent ? transaction.receiver : transaction.sender;
                  
                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.005 }}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* User Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isSent 
                              ? 'bg-gradient-to-br from-red-400 to-pink-500' 
                              : 'bg-gradient-to-br from-green-400 to-emerald-500'
                          } text-white font-semibold`}>
                            {isSent ? (
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-800 truncate">
                                {isSent ? 'Sent to' : 'Received from'} {otherUser.firstName} {otherUser.lastName}
                              </p>
                              <Badge variant={getStatusBadgeVariant(transaction.status)} size="sm">
                                {transaction.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{otherUser.email}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(transaction.createdAt)}</p>
                            {transaction.description && (
                              <p className="text-sm text-gray-700 mt-1 italic">"{transaction.description}"</p>
                            )}
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right flex-shrink-0">
                          <p className={`text-xl font-bold ${
                            isSent ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {isSent ? '-' : '+'}{formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
