import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'; // 1. NHỚ IMPORT THÊM OUTLET Ở ĐÂY
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AlertProvider } from './components/Alert';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { logout } from './utils/auth';
import './App.css';
import AuthLayout from './views/auth/layouts/AuthLayout';
import LoginView from './views/auth/login/LoginView';
import AdminLayout from './views/admin/layouts/AdminLayout';
import DashboardView from './views/admin/dashboard/DashboardView';
import MenuManagementView from './views/admin/menu/MenuManagementView';
import CustomerHeader from './components/CustomerHeader';
import CustomerFooter from './components/CustomerFooter';
import HomeView from './views/online order/home/HomeView'
import ProductDetailView from './views/online order/product detail/ProductDetailView';
import CartView from './views/online order/cart/CartView';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem('access_token');
  });

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('access_token');

      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp && decodedToken.exp < currentTime) {
            console.log("Token đã hết hạn!");
            logout();
          } else {
            setIsLoggedIn(true);
          }
        } catch (error) {
          logout();
        }
      }
    };

    checkToken();
  }, []);

  return (
    <AlertProvider>
      <BrowserRouter>
        <ScrollToTop />

        <Routes>
          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginView />
              </AuthLayout>
            }
          />

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
          </Route>

          <Route
            element={
              <>
                <CustomerHeader isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
                <Outlet /> {/* <Outlet /> là chỗ để các trang con chui vào nằm bên dưới Header */}
                <CustomerFooter />
              </>
            }
          >
            <Route path="/" element={<HomeView />} />
            <Route path="/product/:id" element={<ProductDetailView />} />
            <Route path="/cart" element={<CartView />} />
          </Route>

          {/* Route 404 */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>404 - Không tìm thấy trang</h2>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AlertProvider>
  );
}

export default App;