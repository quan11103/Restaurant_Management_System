import React from 'react';
import { ShoppingCart } from 'lucide-react';
import CartItemComponent from './CartItem';
import { type CartItem as CartItemType } from './MenuOrderingView';
import './CartSidebar.css';

interface CartSidebarProps {
    cartItems: CartItemType[];
    tableName: string;
    onIncrease: (cartItemId: string) => void;
    onDecrease: (cartItemId: string) => void;
    onRemove: (cartItemId: string) => void;
    onSubmitOrder: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
    cartItems,
    tableName,
    onIncrease,
    onDecrease,
    onRemove,
    onSubmitOrder,
}) => {
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="cart-sidebar-container">
            <div className="cart-sidebar-header">
                <h3>
                    <ShoppingCart size={20} /> Giỏ hàng ({totalItems})
                </h3>
                <span className="table-badge">{tableName}</span>
            </div>

            {/* Danh sách các món ăn đã chọn */}
            <div className="cart-sidebar-items">
                {cartItems.length === 0 ? (
                    <div className="empty-cart">Chưa có món nào được chọn</div>
                ) : (
                    cartItems.map(item => (
                        <CartItemComponent
                            key={item.cartItemId}
                            item={item}
                            onIncrease={onIncrease}
                            onDecrease={onDecrease}
                            onRemove={onRemove}
                        />
                    ))
                )}
            </div>

            <div className="cart-sidebar-footer">
                <div className="cart-summary">
                    <span>Tổng tiền:</span>
                    <span className="total-amount">{totalAmount.toLocaleString()} đ</span>
                </div>
                <button
                    className="btn-submit-order"
                    disabled={cartItems.length === 0}
                    onClick={onSubmitOrder}
                >
                    Gửi nhà bếp
                </button>
            </div>
        </div>
    );
};

export default CartSidebar;