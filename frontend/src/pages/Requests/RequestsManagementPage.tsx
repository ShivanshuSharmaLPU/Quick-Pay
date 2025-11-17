import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRequest } from '../../hooks/useRequest';
import { useAppSelector } from '../../store/hook';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';
import { RequestStatus, MoneyRequest } from '../../types';

type TabType = 'received' | 'sent';

export const RequestsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const receivedRequests = useAppSelector((state) => state.request.receivedRequests);
  const sentRequests = useAppSelector((state) => state.request.sentRequests);
  
  const { 
    loading, 
    fetchReceivedRequests, 
    fetchSentRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest
  } = useRequest();

  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<MoneyRequest | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [walletPin, setWalletPin] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    if (activeTab === 'received') {
      fetchReceivedRequests();
    } else {
      fetchSentRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // Only re-run when tab changes, not when functions change

  const filteredRequests = (activeTab === 'received' ? receivedRequests : sentRequests).filter(
    (req) => statusFilter === 'ALL' || req.status === statusFilter
  );

  const handleAcceptClick = (request: MoneyRequest) => {
    setSelectedRequest(request);
    setShowAcceptModal(true);
    setWalletPin('');
    setPinError('');
  };

  const handleAcceptConfirm = async () => {
    if (!selectedRequest) return;
    
    if (walletPin.length !== 4 || !/^\d+$/.test(walletPin)) {
      setPinError('PIN must be 4 digits');
      return;
    }

    const success = await acceptRequest(selectedRequest.id, { walletPin });
    if (success) {
      setShowAcceptModal(false);
      setSelectedRequest(null);
      setWalletPin('');
    }
  };

  const handleReject = async (requestId: number) => {
    await rejectRequest(requestId);
  };

  const handleCancel = async (requestId: number) => {
    await cancelRequest(requestId);
  };

  const getStatusBadgeVariant = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return 'warning';
      case RequestStatus.ACCEPTED:
        return 'success';
      case RequestStatus.REJECTED:
        return 'danger';
      case RequestStatus.CANCELLED:
        return 'default';
      case RequestStatus.EXPIRED:
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-800">Money Requests</h1>
          <p className="text-gray-600 mt-1">Manage your incoming and outgoing requests</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('received')}
              className={`pb-4 px-6 font-semibold transition-colors relative ${
                activeTab === 'received'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Received Requests
              {activeTab === 'received' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`pb-4 px-6 font-semibold transition-colors relative ${
                activeTab === 'sent'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sent Requests
              {activeTab === 'sent' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center mr-2">Filter by:</span>
              {['ALL', RequestStatus.PENDING, RequestStatus.ACCEPTED, RequestStatus.REJECTED, RequestStatus.CANCELLED].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={statusFilter === status ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter(status as RequestStatus | 'ALL')}
                >
                  {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Requests List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <Card>
              <Loading.Skeleton count={5} />
            </Card>
          ) : filteredRequests.length === 0 ? (
            <Card className="text-center py-12">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600 text-lg mb-2">No requests found</p>
              <p className="text-gray-500 text-sm">
                {statusFilter === 'ALL' 
                  ? `You don't have any ${activeTab} requests yet` 
                  : `No ${statusFilter.toLowerCase()} requests found`}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const isReceived = activeTab === 'received';
                const otherUser = isReceived ? request.requester : request.requestedFrom;
                
                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Card>
                      <div className="flex items-start justify-between gap-4">
                        {/* User Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                            {otherUser.firstName[0]}{otherUser.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-800 truncate">
                                {otherUser.firstName} {otherUser.lastName}
                              </p>
                              <Badge variant={getStatusBadgeVariant(request.status)} size="sm">
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{otherUser.email}</p>
                            <p className="text-xs text-gray-500">
                              {isReceived ? 'Requested from you' : 'You requested'} • {formatDateTime(request.createdAt)}
                            </p>
                            {request.message && (
                              <p className="text-sm text-gray-700 mt-2 italic">
                                "{request.message}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
                            {formatCurrency(Number(request.amount))}
                          </p>
                          
                          {request.status === RequestStatus.PENDING && (
                            <div className="flex gap-2">
                              {isReceived ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleAcceptClick(request)}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleReject(request.id)}
                                  >
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancel(request.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Accept Request Modal */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => {
          setShowAcceptModal(false);
          setSelectedRequest(null);
          setWalletPin('');
          setPinError('');
        }}
        title="Accept Request"
      >
        {selectedRequest && (
          <div>
            <p className="text-gray-600 mb-4">
              You are about to send <span className="font-bold text-gray-800">{formatCurrency(Number(selectedRequest.amount))}</span> to{' '}
              <span className="font-bold text-gray-800">
                {selectedRequest.requester.firstName} {selectedRequest.requester.lastName}
              </span>
            </p>

            <Input
              label="Enter your Wallet PIN"
              type="password"
              value={walletPin}
              onChange={(e) => {
                setWalletPin(e.target.value);
                setPinError('');
              }}
              error={pinError}
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAcceptModal(false);
                  setSelectedRequest(null);
                  setWalletPin('');
                  setPinError('');
                }}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleAcceptConfirm}
                fullWidth
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
