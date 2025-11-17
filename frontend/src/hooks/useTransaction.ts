import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  setTransactions, 
  addTransaction, 
  setSummary, 
  setLoading, 
  setError 
} from '../store/slices/transactionSlice';
import { setUser } from '../store/slices/authSlice';
import { transactionApi } from '../api/transactionApi';
import { authApi } from '../api/authApi';
import { SendMoneyData } from '../types';
import toast from 'react-hot-toast';

export const useTransaction = () => {
  const dispatch = useDispatch();
  const { transactions, currentTransaction, loading, error, summary } = 
    useSelector((state: RootState) => state.transaction);

  const sendMoney = async (data: SendMoneyData) => {
    try {
      dispatch(setLoading(true));
      const response = await transactionApi.sendMoney(data);
      
      if (response.success && response.data) {
        dispatch(addTransaction(response.data.transaction));
        toast.success('Money sent successfully!');
        
        // Refresh user profile to get updated balance
        const profileResponse = await authApi.getProfile();
        if (profileResponse.success && profileResponse.data) {
          dispatch(setUser(profileResponse.data.user));
        }
        
        // Refresh all data safely
        try {
          await Promise.all([
            fetchTransactions(),
            fetchSummary(),
            (async () => {
              const { notificationApi } = await import('../api/notificationApi');
              const { setUnreadCount } = await import('../store/slices/notificationSlice');
              const notifResponse = await notificationApi.getUnreadCount();
              if (notifResponse.success && notifResponse.data) {
                dispatch(setUnreadCount(notifResponse.data.unreadCount));
              }
            })()
          ]);
        } catch (refreshErr) {
          console.error('Failed to refresh data after send money:', refreshErr);
        }
        
        return true;
      }
      return false;
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Failed to send money';
      dispatch(setError(message));
      toast.error(message);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchTransactions = async (filters?: Record<string, unknown>) => {
    try {
      dispatch(setLoading(true));
      const response = await transactionApi.getTransactions(filters);
      
      if (response.success && response.data) {
        dispatch(setTransactions(response.data.data));
      }
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Failed to fetch transactions';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await transactionApi.getTransactionSummary();
      
      if (response.success && response.data) {
        // Convert string amounts to numbers and fix property name mismatch
        dispatch(setSummary({
          totalSent: Number(response.data.totalSent),
          totalReceived: Number(response.data.totalReceived),
          totalTransactions: response.data.transactionCount || 0
        }));
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return {
    transactions,
    currentTransaction,
    loading,
    error,
    summary,
    sendMoney,
    fetchTransactions,
    fetchSummary
  };
};
