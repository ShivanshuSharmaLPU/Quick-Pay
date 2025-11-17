import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRequest } from '../../hooks/useRequest';
import { userApi } from '../../api/userApi';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { formatCurrency } from '../../utils/helpers';
import { ROUTES, MIN_AMOUNT, MAX_AMOUNT } from '../../utils/constants';
import { UserSearchResult } from '../../types';

const requestMoneySchema = z.object({
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)), 'Amount must be a number')
    .refine((val) => Number(val) >= MIN_AMOUNT, `Minimum amount is ${MIN_AMOUNT}`)
    .refine((val) => Number(val) <= MAX_AMOUNT, `Maximum amount is ${MAX_AMOUNT}`),
  message: z.string().max(200, 'Message must be less than 200 characters').optional()
});

type RequestMoneyFormData = z.infer<typeof requestMoneySchema>;

enum Step {
  SEARCH = 'SEARCH',
  CONFIRM = 'CONFIRM',
  SUCCESS = 'SUCCESS'
}

export const RequestMoneyPage: React.FC = () => {
  const navigate = useNavigate();
  const { createRequest, loading: creatingRequest } = useRequest();
  
  const [step, setStep] = useState<Step>(Step.SEARCH);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [requestAmount, setRequestAmount] = useState<number>(0);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RequestMoneyFormData>({
    resolver: zodResolver(requestMoneySchema)
  });

  // Search users
  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await userApi.searchUsers(query);
      if (response.success && response.data) {
        setSearchResults(response.data.users);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleUserSelect = (user: UserSearchResult) => {
    setSelectedUser(user);
    setStep(Step.CONFIRM);
    setSearchQuery('');
    setSearchResults([]);
  };

  const onSubmit = async (data: RequestMoneyFormData) => {
    if (!selectedUser) return;

    const success = await createRequest({
      requestedFromEmail: selectedUser.email,
      amount: Number(data.amount),
      message: data.message
    });

    if (success) {
      setRequestAmount(Number(data.amount));
      setStep(Step.SUCCESS);
      reset();
    }
  };

  const handleReset = () => {
    setStep(Step.SEARCH);
    setSelectedUser(null);
    setSearchQuery('');
    setSearchResults([]);
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-800">Request Money</h1>
          <p className="text-gray-600 mt-1">Request payment from any FlexPay user</p>
        </motion.div>

        {/* Step Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === Step.SEARCH ? 'text-purple-600' : step === Step.CONFIRM || step === Step.SUCCESS ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === Step.SEARCH ? 'bg-purple-600 text-white' : step === Step.CONFIRM || step === Step.SUCCESS ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <span className="font-medium hidden sm:inline">Search</span>
            </div>
            <div className="h-0.5 w-16 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === Step.CONFIRM ? 'text-purple-600' : step === Step.SUCCESS ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === Step.CONFIRM ? 'bg-purple-600 text-white' : step === Step.SUCCESS ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className="font-medium hidden sm:inline">Confirm</span>
            </div>
            <div className="h-0.5 w-16 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === Step.SUCCESS ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === Step.SUCCESS ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
              <span className="font-medium hidden sm:inline">Success</span>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Search User */}
          {step === Step.SEARCH && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Who do you want to request from?</h2>
                
                <div className="relative">
                  <Input
                    label="Search by name, email, or UPI ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter name, email or UPI ID..."
                    icon={
                      searching ? (
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )
                    }
                  />

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto"
                    >
                      {searchResults.map((user) => (
                        <motion.button
                          key={user.id}
                          whileHover={{ backgroundColor: '#f3f4f6' }}
                          onClick={() => handleUserSelect(user)}
                          className="w-full p-4 flex items-center gap-4 border-b border-gray-100 last:border-b-0 text-left"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-lg">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.upiId && (
                              <p className="text-xs text-gray-500">{user.upiId}</p>
                            )}
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {/* No Results */}
                  {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-center py-8 text-gray-500"
                    >
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No users found</p>
                      <p className="text-sm mt-1">Try searching with a different keyword</p>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Confirm & Request */}
          {step === Step.CONFIRM && selectedUser && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Request Details</h2>

                {/* Recipient Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Requesting from:</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-xl">
                      {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </p>
                      <p className="text-gray-600">{selectedUser.email}</p>
                      {selectedUser.upiId && (
                        <p className="text-sm text-gray-500">{selectedUser.upiId}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount & Message Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <Input
                    label="Amount"
                    type="number"
                    {...register('amount')}
                    error={errors.amount?.message}
                    placeholder="0.00"
                    step="0.01"
                    min={MIN_AMOUNT}
                    max={MAX_AMOUNT}
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      {...register('message')}
                      placeholder="Add a note about this request..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      fullWidth
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={creatingRequest}
                      fullWidth
                      variant="primary"
                    >
                      Send Request
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === Step.SUCCESS && selectedUser && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="text-center">
                {/* Success Animation - Paper Plane */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                    <motion.svg
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="w-16 h-16 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </motion.svg>
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-3xl font-bold text-gray-800 mb-2"
                >
                  Request Sent Successfully!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-gray-600 mb-6"
                >
                  {selectedUser.firstName} has been notified about your request
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6"
                >
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                    {formatCurrency(requestAmount)}
                  </p>
                  <p className="text-gray-600">
                    Requested from {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex gap-4"
                >
                  <Button
                    variant="outline"
                    onClick={() => navigate(ROUTES.REQUESTS)}
                    fullWidth
                  >
                    View Requests
                  </Button>
                  <Button
                    onClick={handleReset}
                    fullWidth
                    variant="primary"
                  >
                    Request Again
                  </Button>
                </motion.div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
