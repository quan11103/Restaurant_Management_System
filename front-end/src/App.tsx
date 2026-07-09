import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import AuthLayout from './views/auth/layouts/AuthLayout';
import LoginView from './views/auth/login/LoginView';
import HomeView from './views/online order/home/HomeView';

function App() {
  return (
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
        <Route
          path="/"
          element={<HomeView />}
        />
        {/* Route 404 (Bắt mọi URL nhập sai) */}
        <Route
          path="*"
          element={<div style={{ textAlign: 'center', marginTop: '50px' }}><h2>404 - Không tìm thấy trang</h2></div>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;