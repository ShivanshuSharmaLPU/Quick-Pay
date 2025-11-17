import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MoneyRequest } from '../../types';

interface RequestState {
  receivedRequests: MoneyRequest[];
  sentRequests: MoneyRequest[];
  currentRequest: MoneyRequest | null;
  loading: boolean;
  error: string | null;
  pendingReceivedCount: number;
}

const initialState: RequestState = {
  receivedRequests: [],
  sentRequests: [],
  currentRequest: null,
  loading: false,
  error: null,
  pendingReceivedCount: 0
};

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    setReceivedRequests: (state, action: PayloadAction<MoneyRequest[]>) => {
      state.receivedRequests = action.payload;
      state.pendingReceivedCount = action.payload.filter(r => r.status === 'PENDING').length;
      state.error = null;
    },
    setSentRequests: (state, action: PayloadAction<MoneyRequest[]>) => {
      state.sentRequests = action.payload;
      state.error = null;
    },
    addRequest: (state, action: PayloadAction<MoneyRequest>) => {
      state.sentRequests.unshift(action.payload);
    },
    updateRequest: (state, action: PayloadAction<MoneyRequest>) => {
      const { id, status } = action.payload;
      
      // Update in received requests
      const receivedIndex = state.receivedRequests.findIndex(r => r.id === id);
      if (receivedIndex !== -1) {
        state.receivedRequests[receivedIndex] = action.payload;
      }
      
      // Update in sent requests
      const sentIndex = state.sentRequests.findIndex(r => r.id === id);
      if (sentIndex !== -1) {
        state.sentRequests[sentIndex] = action.payload;
      }
      
      // Update pending count
      state.pendingReceivedCount = state.receivedRequests.filter(r => r.status === 'PENDING').length;
    },
    setCurrentRequest: (state, action: PayloadAction<MoneyRequest | null>) => {
      state.currentRequest = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearRequests: (state) => {
      state.receivedRequests = [];
      state.sentRequests = [];
      state.currentRequest = null;
      state.error = null;
      state.pendingReceivedCount = 0;
    }
  }
});

export const {
  setReceivedRequests,
  setSentRequests,
  addRequest,
  updateRequest,
  setCurrentRequest,
  setLoading,
  setError,
  clearRequests
} = requestSlice.actions;

export default requestSlice.reducer;
