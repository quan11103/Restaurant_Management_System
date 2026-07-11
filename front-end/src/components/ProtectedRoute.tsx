import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';

interface ProtectedRouteProps {
    allowedRoles: string[];
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial, sans-serif' }}>
                <h1 style={{ fontSize: '64px', color: '#dc3545', margin: '0 0 10px 0' }}>403</h1>
                <h2 style={{ color: '#333', marginBottom: '15px' }}>Bạn không có quyền truy cập</h2>

                <Link
                    to="/"
                    style={{
                        display: 'inline-block',
                        padding: '10px 24px',
                        backgroundColor: '#e23744',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '500',
                        boxShadow: '0 2px 6px rgba(226, 55, 68, 0.3)',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c02d38')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e23744')}
                >
                    Quay về trang chủ
                </Link>
            </div>
        );
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;