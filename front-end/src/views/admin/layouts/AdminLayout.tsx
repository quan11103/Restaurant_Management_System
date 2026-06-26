import React, { type ReactNode } from 'react';
import { LayoutDashboard, Layers, Utensils, Archive, Users, Smile, Settings } from 'lucide-react';
import Logo from '../../../components/Logo';
import './AdminLayout.css';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="admin-layout">

            {/* Cột trái: Sidebar*/}
            <aside className="admin-sidebar">
                <Logo />
                <nav className="sidebar-nav">
                    <ul>
                        <li className="active">
                            <a href="#"><LayoutDashboard className="sidebar-icon" /><span>Dashboard</span></a>
                        </li>
                        <li>
                            <a href="#"><Layers className="sidebar-icon" /><span>Đơn hàng & Bàn</span></a>
                        </li>
                        <li>
                            <a href="#"><Utensils className="sidebar-icon" /><span>Thực đơn</span></a>
                        </li>
                        <li>
                            <a href="#"><Archive className="sidebar-icon" /><span>Kho & Vật tư</span></a>
                        </li>
                        <li>
                            <a href="#"><Users className="sidebar-icon" /><span>Nhân sự</span></a>
                        </li>
                        <li>
                            <a href="#"><Smile className="sidebar-icon" /><span>Khách hàng</span></a>
                        </li>
                        <li>
                            <a href="#"><Settings className="sidebar-icon" /><span>Cài đặt</span></a>
                        </li>
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