import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Auth Pages
import { SignupPage } from './pages/Auth/SignupPage';
import { SigninPage } from './pages/Auth/SigninPage';

// Main Pages
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { SendMoneyPage } from './pages/SendMoney/SendMoneyPage';
import { RequestMoneyPage } from './pages/RequestMoney/RequestMoneyPage';
import { RequestsManagementPage } from './pages/Requests/RequestsManagementPage';
import { TransactionHistoryPage } from './pages/History/TransactionHistoryPage';
import { NotificationsPage } from './pages/Notifications/NotificationsPage';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoutes';

// Constants
import { ROUTES } from './utils/constants';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        {/* Routes with AnimatePresence for page transitions */}
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.SIGNIN} replace />} />
            <Route path={ROUTES.SIGNIN} element={<SigninPage />} />
            <Route path={ROUTES.SIGNUP} element={<SignupPage />} />

            {/* Protected Routes */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.SEND_MONEY}
              element={
                <ProtectedRoute>
                  <SendMoneyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.REQUEST_MONEY}
              element={
                <ProtectedRoute>
                  <RequestMoneyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.REQUESTS}
              element={
                <ProtectedRoute>
                  <RequestsManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.HISTORY}
              element={
                <ProtectedRoute>
                  <TransactionHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.NOTIFICATIONS}
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to signin */}
            <Route path="*" element={<Navigate to={ROUTES.SIGNIN} replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
