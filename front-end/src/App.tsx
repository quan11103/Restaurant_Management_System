import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AlertProvider } from './components/Alert';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import AuthLayout from './views/auth/layouts/AuthLayout';
import LoginView from './views/auth/login/LoginView';
import HomeView from './views/online order/home/HomeView';
import AdminLayout from './views/admin/layouts/AdminLayout';
import DashboardView from './views/admin/dashboard/DashboardView';
import MenuManagementView from './views/admin/menu/MenuManagementView';
import ProductDetailView from './views/online order/product detail/ProductDetailView';

function App() {
  return (
    <AlertProvider>
      <BrowserRouter>
        <Routes>

          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginView />
              </AuthLayout>
            }
          />

          <Route path="/" element={<HomeView />} />

          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="menu" element={<MenuManagementView />} />
            <Route path="product" element={<ProductDetailView />} />
          </Route>

          {/* Route 404 (Bắt mọi URL nhập sai) */}
          <Route
            path="*"
            element={<div style={{ textAlign: 'center', marginTop: '50px' }}><h2>404 - Không tìm thấy trang</h2></div>}
          />
        </Routes>
      </BrowserRouter>
    </AlertProvider>
  );
}

export default App;