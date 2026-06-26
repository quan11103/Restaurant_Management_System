import React from 'react';
import './App.css';
import AuthLayout from './views/auth/layouts/AuthLayout';
import LoginView from './views/auth/login/LoginView';
import AdminLayout from './views/admin/layouts/AdminLayout';
import MenuManagementView from './views/admin/menu/MenuManagementView';

function App() {
  return (
    // <AuthLayout>
    //   <LoginView />
    // </AuthLayout >
    <AdminLayout>
      <MenuManagementView />
    </AdminLayout>
  );
}

export default App;