import React from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Layers, Utensils, Archive, Users, Smile, Tag } from 'lucide-react';
import Logo from '../../../components/Logo';
import './AdminLayout.css';

const MENU_ITEMS = [
    { path: '/manager/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/manager/orders', name: 'Đơn hàng & Bàn', icon: Layers },
    { path: '/manager/menu', name: 'Thực đơn', icon: Utensils },
    { path: '/manager/inventory', name: 'Kho & Vật tư', icon: Archive },
    { path: '/manager/staff', name: 'Nhân sự', icon: Users },
    { path: '/manager/customers', name: 'Khách hàng', icon: Smile },
    { path: '/manager/promotions', name: 'Khuyến mãi', icon: Tag },
];

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const currentMenuItem = MENU_ITEMS.find(item => location.pathname.includes(item.path));
    const pageTitle = currentMenuItem ? currentMenuItem.name : 'Tổng quan';

    return (
        <div className="admin-layout">

            {/* Cột trái: Sidebar*/}
            <aside className="admin-sidebar">
                <a href="/">
                    <Logo />
                </a>
                <nav className="sidebar-nav">
                    <ul>
                        {MENU_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.path}>
                                    <NavLink to={item.path} className={({ isActive }) => isActive ? "active-link" : ""}>
                                        <Icon className="sidebar-icon" />
                                        <span>{item.name}</span>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>

            {/* Cột phải: Header và nội dung */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <span className="page-title">{pageTitle}</span>
                    </div>
                    <div className="header-right">
                        <span className="user-profile">Xin chào quản trị viên</span>
                    </div>
                </header>

                {/* Khu vực hiển thị View */}
                <div className="admin-content">
                    {/* 3. Thay {children} bằng <Outlet /> */}
                    <Outlet />
                </div>
            </main>

        </div>
    );
};

export default AdminLayout;