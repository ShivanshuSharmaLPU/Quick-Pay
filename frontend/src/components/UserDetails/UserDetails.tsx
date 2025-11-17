import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook.tsx";
import { authApi } from "../../api/authApi";
import { setUser, setLoading, setError } from "../../store/slices/authSlice";

export default function UserDetails() {
  const dispatch = useAppDispatch();
  const { loading, user, error } = useAppSelector((state) => state.auth);

  const loadUserProfile = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await authApi.getProfile();
      if (response.success && response.data?.user) {
        dispatch(setUser(response.data.user));
      }
    } catch {
      dispatch(setError('Failed to load profile'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleRefresh = () => {
    loadUserProfile();
  };

  return (
    <div className="flex justify-center items-start bg-gradient-to-b from-indigo-50 via-indigo-100 to-indigo-200 py-6 h-96">
      <div className="max-w-lg w-full bg-white shadow-2xl rounded-lg p-8 flex-1 h-full relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-indigo-800">User Details</h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 bg-indigo-100 hover:bg-indigo-200 rounded-full transition duration-200 disabled:opacity-50"
            title="Refresh Balance"
          >
            <svg
              className={`w-5 h-5 text-indigo-600 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500"></div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-center text-red-600 font-medium">{error}</p>
        )}

        {/* User Details */}
        {user && (
          <div>
            <div className="space-y-6">
              {/* Each Field */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">First Name:</span>
                <span className="font-medium text-indigo-800">{user.firstName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Last Name:</span>
                <span className="font-medium text-indigo-800">{user.lastName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Email:</span>
                <span className="font-medium text-indigo-800">{user.email}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Balance:</span>
                <span className="font-medium text-indigo-800">₹{user.balance}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">UPI ID:</span>
                <span className="font-medium text-indigo-800">{user.upiId}</span>
              </div>
            </div>

            {/* Update Button */}
            <div className="mt-8 flex justify-center">
              <button className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-500 hover:shadow-md transition duration-300">
                Add Money
              </button>
            </div>
          </div>
        )}

        {/* Decorative Circle */}
        <div className="absolute top-4 right-4 bg-indigo-100 rounded-full w-16 h-16 opacity-30 blur-md"></div>
      </div>
    </div>
  );
}   
