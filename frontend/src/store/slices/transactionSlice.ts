import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '../../types';

interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
  summary: {
    totalSent: number;
    totalReceived: number;
    totalTransactions: number;
  } | null;
}

const initialState: TransactionState = {
  transactions: [],
  currentTransaction: null,
  loading: false,
  error: null,
  summary: null
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      state.error = null;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    setCurrentTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.currentTransaction = action.payload;
    },
    setSummary: (state, action: PayloadAction<{ totalSent: number; totalReceived: number; totalTransactions: number }>) => {
      state.summary = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.currentTransaction = null;
      state.error = null;
    }
  }
});

export const {
  setTransactions,
  addTransaction,
  setCurrentTransaction,
  setSummary,
  setLoading,
  setError,
  clearTransactions
} = transactionSlice.actions;

export default transactionSlice.reducer;
