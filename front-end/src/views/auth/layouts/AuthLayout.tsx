import React from 'react';
import './AuthLayout.css';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="auth-layout-container">

            {/* Cột trái: Banner */}
            <div className="auth-banner">
                <div className="auth-banner-content">
                    <h1 className="auth-brand-name">Nhà hàng Hòa Hảo</h1>
                    <p className="auth-slogan">
                        Nâng tầm trải nghiệm ẩm thực
                    </p>
                </div>
            </div>

            {/* Cột phải: Form */}
            <div className="auth-content">
                <div className="auth-content-wrapper">
                    {children}
                </div>
            </div>

        </div>
    );
};

export default AuthLayout;