import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import './index.css'

// ========================================
// PUBLIC PAGES (Auth)
// ========================================
import LoginPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import RegisterMerchantPage from './pages/RegisterMerchantPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

// ========================================
// CUSTOMER PAGES
// ========================================
import CustomerDashboard from './pages/CustomerDashboard';
import MyRatingsPage from './pages/MyRatingsPage';
import StoreReviewsPage from './pages/StoreReviewsPage';

// ========================================
// MERCHANT PAGES
// ========================================
import MerchantDashboard from './pages/MerchantDashboard';
import MerchantPendingApprovalPage from './pages/MerchantPendingApprovalPage';
import MerchantRejectedPage from './pages/MerchantRejectedPage';

// ========================================
// ADMIN PAGES
// ========================================
import AdminDashboard from './pages/AdminDashboard';

// ========================================
// PROTECTED ROUTE COMPONENT
// ========================================
import ProtectedRoute from './components/ProtectedRoute';

import ComponentTestPage from './pages/ComponentTestPage';

function App() {
  return (

    <AuthProvider>
      {/* Toast notifications */}
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
              primary: '#2D9D78',
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

      <BrowserRouter>
        <Routes>
          {/* ========================================
              PUBLIC ROUTES (Authentication)
          ======================================== */}
          
          {/* Login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Forgot Password */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Reset Password */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          
          {/* Register Merchant (3 steps) */}
          <Route path="/register/merchant" element={<RegisterMerchantPage />} />
          
          {/* Verify Email */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* ========================================
              CUSTOMER ROUTES (Protected)
          ======================================== */}
          
          {/* Customer Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* My Ratings */}
          <Route 
            path="/my-ratings" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <MyRatingsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Store Reviews (Public - anyone can view) */}
          <Route path="/stores/:storeId/reviews" element={<StoreReviewsPage />} />

          {/* ========================================
              MERCHANT ROUTES (Protected)
          ======================================== */}
          
          {/* Merchant Dashboard */}
          <Route 
            path="/merchant/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Merchant Pending Approval */}
          <Route 
            path="/merchant/pending-approval" 
            element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantPendingApprovalPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Merchant Rejected */}
          <Route 
            path="/merchant/rejected" 
            element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantRejectedPage />
              </ProtectedRoute>
            } 
          />

          {/* ========================================
              ADMIN ROUTES (Protected)
          ======================================== */}
          
          {/* Admin Dashboard */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* ========================================
              DEFAULT & 404 ROUTES
          ======================================== */}
          
          {/* Default route - redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

          {/* Component Test Page - for development only */}
            <Route path="/test-components" element={<ComponentTestPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;