import { useState, useRef, useEffect } from 'react';
import { User, Menu, LogOut, ClipboardList } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';
import Logo from './Logo';
import SearchBar from '../SearchBar';
import CartBadge from '../CartBadge';
import './CustomerHeader.css';

interface CustomerHeaderProps {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ isLoggedIn, setIsLoggedIn }) => {
    const [searchText, setSearchText] = useState('');
    const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState<string | null>(null);

    const userPopupRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Đồng bộ thông tin user (token, name, role) từ localStorage
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const storedName = localStorage.getItem('user_name');
        const storedRole = localStorage.getItem('user_role');

        setIsLoggedIn(!!token);
        setUserName(storedName || 'Thành viên');
        setUserRole(storedRole);
    }, [isLoggedIn, isUserPopupOpen, setIsLoggedIn]);

    // Xử lý đóng popup khi click ra ngoài vùng chứa
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userPopupRef.current && !userPopupRef.current.contains(event.target as Node)) {
                setIsUserPopupOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        setIsUserPopupOpen(false);
        setUserRole(null);
    };

    const handleTriggerSearch = () => {
        if (!searchText.trim()) return;
        navigate(`/search?q=${encodeURIComponent(searchText)}`);
    };

    // Hàm chuyển đổi vai trò (userRole) sang Chức vụ tiếng Việt
    const getRoleDisplayName = () => {
        if (!isLoggedIn) return 'Tài khoản';

        switch (userRole) {
            case 'MANAGER':
                return 'Quản lí';
            case 'WAITER':
                return 'Phục vụ';
            case 'CASHIER':
                return 'Thu ngân';
            case 'CLIENT':
                return 'Khách hàng';
            default:
                return 'Tài khoản';
        }
    };

    // Xác định đường dẫn dựa trên role của user (Cả WAITER và CASHIER đều vào /table-map)
    const cartPath = (userRole === 'WAITER' || userRole === 'CASHIER') ? '/table-map' : '/cart';

    // Hàm render icon + text tương ứng với role
    const renderCartOrAction = () => {
        if (userRole === 'WAITER') {
            return (
                <>
                    <ClipboardList size={22} />
                    <span className="action-text hidden-mobile">Đặt món</span>
                </>
            );
        }

        if (userRole === 'CASHIER') {
            return (
                <>
                    <ClipboardList size={22} />
                    <span className="action-text hidden-mobile">Thanh toán</span>
                </>
            );
        }

        return (
            <>
                <CartBadge size={22} />
                <span className="action-text hidden-mobile">Giỏ hàng</span>
            </>
        );
    };

    return (
        <header className="customer-header">
            <div className="container header-container">

                <div className="header-left">
                    <button className="mobile-menu-btn" title="Menu">
                        <Menu size={24} />
                    </button>
                    <div className="header-logo">
                        <a href="/" className="logo-link">
                            <Logo className="header-logo-image" />
                            <div className="logo-text-group">
                                <span className="logo-main">Hòa Hảo</span>
                                <span className="logo-sub">Restaurant</span>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="header-search hidden-mobile">
                    <SearchBar
                        value={searchText}
                        onChange={setSearchText}
                        onSearch={handleTriggerSearch}
                        placeholder="Hôm nay bạn muốn ăn gì?"
                    />
                </div>

                <div className="header-actions">

                    <div className="user-action-wrapper" ref={userPopupRef}>
                        <button
                            className={`action-btn user-btn ${isLoggedIn ? 'user-logged-in' : ''}`}
                            onClick={() => setIsUserPopupOpen(!isUserPopupOpen)}
                        >
                            <User size={22} />
                            <span className="action-text hidden-mobile">
                                {getRoleDisplayName()}
                            </span>
                        </button>

                        {isUserPopupOpen && (
                            <div className="user-popup">
                                {isLoggedIn && (
                                    <div className="user-popup-header">
                                        <p>Xin chào <strong>{userName}</strong>!</p>
                                    </div>
                                )}
                                <div className="user-popup-body">
                                    {isLoggedIn ? (
                                        <button className="btn-logout-popup" onClick={handleLogout}>
                                            <LogOut size={16} />
                                            Đăng xuất
                                        </button>
                                    ) : (
                                        <>
                                            <Link to="/login" className="btn-login-popup" onClick={() => setIsUserPopupOpen(false)}>
                                                Đăng nhập
                                            </Link>
                                            <Link to="/register" className="btn-register-popup" onClick={() => setIsUserPopupOpen(false)}>
                                                Đăng ký
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Điều hướng linh hoạt theo role */}
                    <Link to={cartPath} className="action-btn cart-wrapper">
                        {renderCartOrAction()}
                    </Link>
                </div>

            </div>
        </header>
    );
};

export default CustomerHeader;