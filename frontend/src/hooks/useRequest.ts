import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  setReceivedRequests, 
  setSentRequests, 
  addRequest, 
  updateRequest, 
  setLoading, 
  setError 
} from '../store/slices/requestSlice';
import { requestApi } from '../api/requestApi';
import { CreateRequestData, AcceptRequestData } from '../types';
import toast from 'react-hot-toast';

export const useRequest = () => {
  const dispatch = useDispatch();
  const { 
    receivedRequests, 
    sentRequests, 
    currentRequest, 
    loading, 
    error, 
    pendingReceivedCount 
  } = useSelector((state: RootState) => state.request);

  const createRequest = async (data: CreateRequestData) => {
    try {
      dispatch(setLoading(true));
      const response = await requestApi.createRequest(data);
      
      if (response.success && response.data) {
        dispatch(addRequest(response.data.request));
        toast.success('Money request sent!');
        
        // Refresh data safely
        try {
          await Promise.all([
            fetchSentRequests(),
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
          console.error('Failed to refresh data after create request:', refreshErr);
        }
        
        return true;
      }
      return false;
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Failed to create request';
      dispatch(setError(message));
      toast.error(message);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const acceptRequest = async (id: number, data: AcceptRequestData) => {
    try {
      dispatch(setLoading(true));
      const response = await requestApi.acceptRequest(id, data);
      
      if (response.success && response.data) {
        dispatch(updateRequest(response.data.request));
        toast.success('Request accepted and payment completed!');
        
        // Small delay to ensure backend transaction is fully committed
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh all data in parallel to avoid race conditions
        await Promise.all([
          // Refresh user profile
          (async () => {
            try {
              const { authApi } = await import('../api/authApi');
              const { setUser } = await import('../store/slices/authSlice');
              const profileResponse = await authApi.getProfile();
              if (profileResponse.success && profileResponse.data) {
                dispatch(setUser(profileResponse.data.user));
              }
            } catch (err) {
              console.error('Failed to refresh profile:', err);
            }
          })(),
          
          // Refresh transaction history
          (async () => {
            try {
              const { transactionApi } = await import('../api/transactionApi');
              const { setTransactions } = await import('../store/slices/transactionSlice');
              const transactionsResponse = await transactionApi.getTransactions();
              if (transactionsResponse.success && transactionsResponse.data) {
                dispatch(setTransactions(transactionsResponse.data.data));
              }
            } catch (err) {
              console.error('Failed to refresh transactions:', err);
            }
          })(),
          
          // Refresh transaction summary
          (async () => {
            try {
              const { transactionApi } = await import('../api/transactionApi');
              const { setSummary } = await import('../store/slices/transactionSlice');
              const summaryResponse = await transactionApi.getTransactionSummary();
              if (summaryResponse.success && summaryResponse.data) {
                dispatch(setSummary({
                  totalSent: Number(summaryResponse.data.totalSent),
                  totalReceived: Number(summaryResponse.data.totalReceived),
                  totalTransactions: summaryResponse.data.transactionCount || 0
                }));
              }
            } catch (err) {
              console.error('Failed to refresh summary:', err);
            }
          })(),
          
          // Refresh requests lists
          (async () => {
            try {
              await fetchReceivedRequests();
              await fetchSentRequests();
            } catch (err) {
              console.error('Failed to refresh requests:', err);
            }
          })(),
          
          // Refresh notifications
          (async () => {
            try {
              const { notificationApi } = await import('../api/notificationApi');
              const { setUnreadCount } = await import('../store/slices/notificationSlice');
              const notifResponse = await notificationApi.getUnreadCount();
              if (notifResponse.success && notifResponse.data) {
                dispatch(setUnreadCount(notifResponse.data.unreadCount));
              }
            } catch (err) {
              console.error('Failed to refresh notifications:', err);
            }
          })()
        ]);
        
        return true;
      }
      return false;
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Failed to accept request';
      dispatch(setError(message));
      toast.error(message);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const rejectRequest = async (id: number) => {
    try {
      dispatch(setLoading(true));
      const response = await requestApi.rejectRequest(id);
      
      if (response.success && response.data) {
        dispatch(updateRequest(response.data.request));
        toast.success('Request rejected');
        
        // Refresh data safely
        try {
          await Promise.all([
            fetchReceivedRequests(),
            fetchSentRequests(),
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
          console.error('Failed to refresh data after reject:', refreshErr);
        }
        
        return true;
      }
      return false;
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Failed to reject request';
      dispatch(setError(message));
      toast.error(message);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const cancelRequest = async (id: number) => {
    try {
      dispatch(setLoading(true));
      const response = await requestApi.cancelRequest(id);
      
      if (response.success && response.data) {
        dispatch(updateRequest(response.data.request));
        toast.success('Request cancelled');
        
        // Refresh data safely
        try {
          await Promise.all([
            fetchReceivedRequests(),
            fetchSentRequests()
          ]);
        } catch (refreshErr) {
          console.error('Failed to refresh data after cancel:', refreshErr);
        }
        
        return true;
      }
      return false;
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Failed to cancel request';
      dispatch(setError(message));
      toast.error(message);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchReceivedRequests = async (filters?: Record<string, unknown>) => {
    try {
      dispatch(setLoading(true));
      const response = await requestApi.getReceivedRequests(filters);
      
      if (response.success && response.data) {
        dispatch(setReceivedRequests(response.data.data));
      }
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Failed to fetch requests';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchSentRequests = async (filters?: Record<string, unknown>) => {
    try {
      dispatch(setLoading(true));
      const response = await requestApi.getSentRequests(filters);
      
      if (response.success && response.data) {
        dispatch(setSentRequests(response.data.data));
      }
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Failed to fetch requests';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    receivedRequests,
    sentRequests,
    currentRequest,
    loading,
    error,
    pendingReceivedCount,
    createRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    fetchReceivedRequests,
    fetchSentRequests
  };
};
