import { useState, useRef, useEffect } from 'react';
import { User, MapPin, Menu, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import SearchBar from './SearchBar';
import CartBadge from './CartBadge';
import './CustomerHeader.css';

interface CustomerHeaderProps {
    cartItemCount?: number;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ cartItemCount = 0 }) => {
    const [searchText, setSearchText] = useState('');
    const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');

    const userPopupRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Mỗi khi popup được mở, kiểm tra lại token trong localStorage để cập nhật trạng thái mới nhất
    useEffect(() => {
        if (isUserPopupOpen) {
            const token = localStorage.getItem('access_token');
            const storedName = localStorage.getItem('user_name');
            setIsLoggedIn(!!token); // Nếu có token sẽ là true, ngược lại là false
            setUserName(storedName || 'Thành viên')
        }
    }, [isUserPopupOpen]);

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
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_name');

        setIsLoggedIn(false);
        setIsUserPopupOpen(false);

        navigate('/');
        window.location.reload();
    };

    const handleTriggerSearch = () => {
        if (!searchText.trim()) return;
        console.log("Đang gọi API tìm kiếm với từ khóa:", searchText);
    };

    return (
        <header className="customer-header">
            <div className="container header-container">

                {/* Phần Left, Search, Address giữ nguyên giống file cũ của bạn */}
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

                <div className="header-address hidden-mobile">
                    <MapPin size={22} className="text-highlight" />
                    <div className="address-info">
                        <span className="address-label">Giao đến:</span>
                        <span className="address-text">Vui lòng chọn địa chỉ giao hàng...</span>
                    </div>
                </div>

                <div className="header-actions">

                    <div className="user-action-wrapper" ref={userPopupRef}>
                        <button
                            className={`action-btn user-btn ${isLoggedIn ? 'user-logged-in' : ''}`}
                            onClick={() => setIsUserPopupOpen(!isUserPopupOpen)}
                        >
                            <User size={22} />
                            <span className="action-text hidden-mobile">
                                {isLoggedIn ? 'Tài khoản' : 'Tài khoản'}
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
                                    {/* Sử dụng toán tử điều kiện để thay đổi giao diện nút */}
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

                    <div className="action-btn cart-wrapper">
                        <CartBadge
                            itemCount={cartItemCount}
                            size={22}
                            onClick={() => console.log("Mở trang giỏ hàng!")}
                        />
                        <span className="action-text hidden-mobile">Giỏ hàng</span>
                    </div>
                </div>

            </div>
        </header>
    );
};

export default CustomerHeader;