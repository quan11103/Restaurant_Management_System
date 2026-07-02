import React from 'react';
import './CartItemList.css';

interface CartItemListProps {
    children: React.ReactNode;
    className?: string;
}

const CartItemList: React.FC<CartItemListProps> = ({ children, className = '' }) => {
    return (
        <div className={`cart-item-list-container ${className}`.trim()}>

            <div className="cart-list-header hidden-mobile">
                <div className="header-col-product">Món ăn</div>
                <div className="header-col-price">Đơn giá</div>
                <div className="header-col-qty">Số lượng</div>
                <div className="header-col-total">Thành tiền</div>
                <div className="header-col-action"></div>
            </div>

            <div className="cart-list-body">
                {children}
            </div>

        </div>
    );
};

export default CartItemList;