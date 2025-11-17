import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransaction } from '../../hooks/useTransaction';
import { userApi } from '../../api/userApi';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { formatCurrency } from '../../utils/helpers';
import { ROUTES, MIN_AMOUNT, MAX_AMOUNT } from '../../utils/constants';
import { UserSearchResult } from '../../types';

const sendMoneySchema = z.object({
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)), 'Amount must be a number')
    .refine((val) => Number(val) >= MIN_AMOUNT, `Minimum amount is ${MIN_AMOUNT}`)
    .refine((val) => Number(val) <= MAX_AMOUNT, `Maximum amount is ${MAX_AMOUNT}`),
  walletPin: z.string().length(4, 'PIN must be 4 digits').regex(/^\d+$/, 'PIN must contain only digits')
});

type SendMoneyFormData = z.infer<typeof sendMoneySchema>;

enum Step {
  SEARCH = 'SEARCH',
  CONFIRM = 'CONFIRM',
  SUCCESS = 'SUCCESS'
}

export const SendMoneyPage: React.FC = () => {
  const navigate = useNavigate();
  const { sendMoney, loading: sendingMoney } = useTransaction();
  
  const [step, setStep] = useState<Step>(Step.SEARCH);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState<number>(0);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SendMoneyFormData>({
    resolver: zodResolver(sendMoneySchema)
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
      } else {
        console.error('Search failed: Invalid response');
      }
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message;
      console.error('Search failed:', message || error);
      // Don't show toast for search errors as it would be annoying while typing
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

  const onSubmit = async (data: SendMoneyFormData) => {
    if (!selectedUser) return;

    const success = await sendMoney({
      receiverEmail: selectedUser.email,
      amount: Number(data.amount),
      walletPin: data.walletPin
    });

    if (success) {
      setTransactionAmount(Number(data.amount));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
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
          <h1 className="text-3xl font-bold text-gray-800">Send Money</h1>
          <p className="text-gray-600 mt-1">Transfer money to any FlexPay user</p>
        </motion.div>

        {/* Step Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === Step.SEARCH ? 'text-blue-600' : step === Step.CONFIRM || step === Step.SUCCESS ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === Step.SEARCH ? 'bg-blue-600 text-white' : step === Step.CONFIRM || step === Step.SUCCESS ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <span className="font-medium hidden sm:inline">Search</span>
            </div>
            <div className="h-0.5 w-16 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === Step.CONFIRM ? 'text-blue-600' : step === Step.SUCCESS ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === Step.CONFIRM ? 'bg-blue-600 text-white' : step === Step.SUCCESS ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
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
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Recipient</h2>
                
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
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
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

          {/* Step 2: Confirm & Send */}
          {step === Step.CONFIRM && selectedUser && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Confirm Transaction</h2>

                {/* Recipient Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Sending to:</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl">
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

                {/* Amount & PIN Form */}
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

                  <Input
                    label="Wallet PIN"
                    type="password"
                    {...register('walletPin')}
                    error={errors.walletPin?.message}
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                  />

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
                      loading={sendingMoney}
                      fullWidth
                    >
                      Send Money
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
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="w-16 h-16 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-3xl font-bold text-gray-800 mb-2"
                >
                  Money Sent Successfully!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-gray-600 mb-6"
                >
                  Your payment has been completed
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6"
                >
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                    {formatCurrency(transactionAmount)}
                  </p>
                  <p className="text-gray-600">
                    Sent to {selectedUser.firstName} {selectedUser.lastName}
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
                    onClick={() => navigate(ROUTES.HISTORY)}
                    fullWidth
                  >
                    View History
                  </Button>
                  <Button
                    onClick={handleReset}
                    fullWidth
                  >
                    Send Again
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
