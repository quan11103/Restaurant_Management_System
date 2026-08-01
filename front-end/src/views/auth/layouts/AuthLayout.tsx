import React from 'react';
import Logo from '../../../components/layout/Logo';
import './AuthLayout.css';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="auth-layout-container">
            {/* Header đơn giản chỉ chứa Logo phía bên trái */}
            <header className="auth-header">
                <a href="/" className="auth-logo-link">
                    <Logo className="auth-logo-image" />
                    <div className="auth-logo-text-group">
                        <span className="auth-logo-main">Hòa Hảo</span>
                        <span className="auth-logo-sub">Restaurant</span>
                    </div>
                </a>
            </header>

            {/* Vùng Banner chính chứa form ở chính giữa */}
            <main className="auth-banner-container">
                <div className="auth-content">
                    <div className="auth-content-wrapper">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AuthLayout;