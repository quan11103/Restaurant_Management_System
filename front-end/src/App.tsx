import React from 'react';
import './App.css';
import AuthLayout from './views/auth/layouts/AuthLayout';
import LoginView from './views/auth/login/LoginView';
import AdminLayout from './views/admin/layouts/AdminLayout';

function App() {
  return (
    // <AuthLayout>
    //   <LoginView />
    // </AuthLayout >
    <AdminLayout>
      <LoginView />
    </AdminLayout>
  );
}

export default App;