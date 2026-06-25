import React, { type ReactNode } from 'react';
import './AdminLayout.css';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="admin-layout">

            {/* Cột trái: Sidebar*/}
            <aside className="admin-sidebar">
                <div className="sidebar-logo">
                    <img src="/logo.png" alt="Nhà hàng Hòa Hảo" className="sidebar-logo-img" />
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li className="active"><a href="#">Dashboard</a></li>
                        <li><a href="#">Đơn hàng & Bàn</a></li>
                        <li><a href="#">Thực đơn</a></li>
                        <li><a href="#">Kho & Nguyên liệu</a></li>
                        <li><a href="#">Nhân sự</a></li>
                        <li><a href="#">Khách hàng</a></li>
                        <li><a href="#">Cài đặt</a></li>
                    </ul>
                </nav>
            </aside>

            {/* Cột phải: Header và nội dung */}
            <main className="admin-main">

                {/* Thanh Header */}
                <header className="admin-header">
                    <div className="header-left">
                        <span className="page-title">Tổng quan (Dashboard)</span>
                    </div>
                    <div className="header-right">
                        <span className="user-profile">Xin chào quản trị viên</span>
                    </div>
                </header>

                {/* Khu vực hiển thị View */}
                <div className="admin-content">
                    {children}
                </div>

            </main>

        </div>
    );
};

export default AdminLayout;