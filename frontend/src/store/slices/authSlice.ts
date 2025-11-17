import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { STORAGE_KEYS } from '../../utils/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Load user data from localStorage if available
const loadUserFromStorage = (): User | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Failed to parse user data from localStorage:', error);
      return null;
    }
  }
  return null;
};

const initialState: AuthState = {
  user: loadUserFromStorage(),
  token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(action.payload));
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload);
    },
    setAuth: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(action.payload.user));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    },
    updateBalance: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.balance = action.payload;
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(state.user));
      }
    }
  }
});

export const {
  setUser,
  setToken,
  setAuth,
  setLoading,
  setError,
  logout,
  updateBalance
} = authSlice.actions;

export default authSlice.reducer;
