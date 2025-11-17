import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { setAuth, setError, setLoading, logout as logoutAction } from '../store/slices/authSlice';
import { authApi } from '../api/authApi';
import { SignupData, SigninData } from '../types';
import toast from 'react-hot-toast';
import { ROUTES } from '../utils/constants';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  const signup = async (data: SignupData) => {
    try {
      dispatch(setLoading(true));
      const response = await authApi.signup(data);
      
      if (response.success && response.data) {
        dispatch(setAuth({
          user: response.data.user,
          token: response.data.token
        }));
        toast.success('Account created successfully!');
        navigate(ROUTES.DASHBOARD);
      }
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Signup failed';
      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signin = async (data: SigninData) => {
    try {
      dispatch(setLoading(true));
      const response = await authApi.signin(data);
      
      if (response.success && response.data) {
        dispatch(setAuth({
          user: response.data.user,
          token: response.data.token
        }));
        toast.success('Welcome back!');
        navigate(ROUTES.DASHBOARD);
      }
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Signin failed';
      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    toast.success('Logged out successfully');
    navigate(ROUTES.SIGNIN);
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    signup,
    signin,
    logout
  };
};
