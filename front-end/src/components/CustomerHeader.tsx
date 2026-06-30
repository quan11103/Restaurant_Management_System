import { useState } from 'react';
import { User, MapPin, Menu } from 'lucide-react';
import Logo from './Logo';
import SearchBar from './SearchBar';
import CartBadge from './CartBadge';
import './CustomerHeader.css';

interface CustomerHeaderProps {
    cartItemCount?: number;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ cartItemCount = 0 }) => {
    const [searchText, setSearchText] = useState('');

    const handleTriggerSearch = () => {
        if (!searchText.trim()) return;

        console.log("Đang gọi API tìm kiếm với từ khóa:", searchText);
        // Code điều hướng URL hoặc lọc danh sách sản phẩm ở đây
    };

    return (
        <header className="customer-header">
            <div className="container header-container">

                {/* Logo & menu trên di động */}
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

                {/* Thanh tìm kiếm (ẩn trên mobile) */}
                <div className="header-search hidden-mobile">
                    <SearchBar
                        value={searchText}
                        onChange={setSearchText}
                        onSearch={handleTriggerSearch}
                        placeholder="Hôm nay bạn muốn ăn gì?"
                    />
                </div>

                {/* Chọn địa chỉ giao hàng (ẩn trên mobile) */}
                <div className="header-address hidden-mobile">
                    <MapPin size={22} className="text-highlight" />
                    <div className="address-info">
                        <span className="address-label">Giao đến:</span>
                        <span className="address-text">Vui lòng chọn địa chỉ giao hàng...</span>
                    </div>
                </div>

                {/* Nhóm hành động */}
                <div className="header-actions">
                    <button className="action-btn user-btn">
                        <User size={22} />
                        <span className="action-text hidden-mobile">Tài khoản</span>
                    </button>

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