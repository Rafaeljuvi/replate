import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import './index.css'


// PUBLIC PAGES (Auth)
import LoginPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import RegisterMerchantPage from './pages/RegisterMerchantPage';
import VerifyEmailPage from './pages/VerifyEmailPage';


// CUSTOMER PAGES
import CustomerHomePage from './pages/CustomerDashboard';
import MyRatingsPage from './pages/MyRatingsPage';
import StoreReviewsPage from './pages/StoreReviewsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import StoreDetailPage from './pages/StoreDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ActiveOrdersPage from './pages/ActiveOrdersPage';
import OrderHistoryPage from './pages/OrderHistory';


// MERCHANT PAGES
import MerchantDashboard from './pages/MerchantDashboard';
import MerchantPendingApprovalPage from './pages/MerchantPendingApprovalPage';
import ManageProductsPage from './pages/ManageProductsPage';
import StoreSettingsPage from './pages/StoreSettings';
import ManageOrdersPage from './pages/ManageOrdersMerchant';


// ADMIN PAGES
import AdminDashboard from './pages/AdminDashboard';


// PROTECTED ROUTE COMPONENT

import ProtectedRoute from './components/ProtectedRoute';


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
                <CustomerHomePage/>
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

          {/* product Detail */}
          <Route
            path='/products/:id'
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <ProductDetailPage/>
              </ProtectedRoute>
            }
          >
          </Route>

          {/* Store detail Page */}
          <Route
            path='/stores/:id'
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <StoreDetailPage/>
              </ProtectedRoute>
            }
          >
          </Route>

          {/* Shopping cart page */}
          <Route 
            path='/cart' 
            element={
            <ProtectedRoute allowedRoles={['user']}>
              <CartPage/>
            </ProtectedRoute>}>
          </Route>

          {/* CheckoutPage */}
          <Route path='/checkout' element={
            <ProtectedRoute allowedRoles ={['user']}>
                <CheckoutPage/>
            </ProtectedRoute>
          }>
          </Route>

          <Route path='/orders/active' element={
            <ProtectedRoute allowedRoles={['user']}>
              <ActiveOrdersPage/>
            </ProtectedRoute>
          }>
          </Route>

          <Route path='/orders/history' element={
            <ProtectedRoute allowedRoles={['user']}>
              <OrderHistoryPage/>
            </ProtectedRoute>
          }>
          </Route>

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

          <Route
            path='/merchant/products'
            element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <ManageProductsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/merchant/settings'
            element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <StoreSettingsPage/>
              </ProtectedRoute>
            }
          />

          <Route path='/merchant/orders' element={
            <ProtectedRoute allowedRoles={['merchant']}>
                <ManageOrdersPage/>
            </ProtectedRoute>
          }>

          </Route>

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
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;