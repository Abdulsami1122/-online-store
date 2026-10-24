import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import SellerLayout from './components/layout/SellerLayout';

// User Side Pages (Customer / Shopper)
import UserStorePage from './pages/user/UserStorePage';
import UserCheckoutPage from './pages/user/UserCheckoutPage';
import UserTrackingPage from './pages/user/UserTrackingPage';

// Admin / Seller Side Pages
import LoginPage from './pages/LoginPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import ProductManagementPage from './pages/ProductManagementPage';
import OrdersDashboardPage from './pages/OrdersDashboardPage';
import AiAssistantPage from './pages/AiAssistantPage';
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';

// Admin Protected Route Component
function AdminProtectedRoute({ children }) {
  const { user, isAdmin } = useAuth();
  
  // If not logged in as admin/seller, redirect to admin login
  if (!user || (!isAdmin && user.role !== 'admin' && user.role !== 'seller')) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <div>
      <Routes>
        {/* ========================================================= */}
        {/* USER SIDE (Single All-in-One Shop Landing Page)           */}
        {/* ========================================================= */}
        <Route path="/" element={<UserStorePage />} />
        <Route path="/store" element={<Navigate to="/" replace />} />
        <Route path="/checkout" element={<UserStorePage defaultOpenCart={true} />} />
        <Route path="/track" element={<UserStorePage defaultSection="track" />} />
        <Route path="/track/:orderId" element={<UserStorePage defaultSection="track" />} />
        <Route path="/chat" element={<UserStorePage defaultOpenAi={true} />} />

        {/* ========================================================= */}
        {/* ADMIN SIDE (Seller portal: Login & Protected Dashboard)   */}
        {/* ========================================================= */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes - Only show admin side AFTER admin logs in */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <SellerLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<SellerDashboardPage />} />
          <Route path="products" element={<ProductManagementPage />} />
          <Route path="orders" element={<OrdersDashboardPage />} />
          <Route path="ai" element={<AiAssistantPage />} />
          <Route path="settings" element={<SubscriptionPlansPage />} />
        </Route>

        {/* Backwards compatibility */}
        <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="/dashboard/*" element={<Navigate to="/admin" replace />} />

        {/* Catch-all fallback redirects to the shop landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
