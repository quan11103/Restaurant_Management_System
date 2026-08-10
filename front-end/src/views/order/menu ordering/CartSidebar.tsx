import React from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import CartItemComponent from './CartItem';
import Button from '../../../components/Button';
import { type CartItem as CartItemType } from './MenuOrderingView';
import './CartSidebar.css';

interface CartSidebarProps {
    cartItems: CartItemType[];
    tableName: string;
    onIncrease: (cartItemId: string) => void;
    onDecrease: (cartItemId: string) => void;
    onRemove: (cartItemId: string) => void;
    onSubmitOrder: () => void;
    isSubmitting?: boolean;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
    cartItems,
    tableName,
    onIncrease,
    onDecrease,
    onRemove,
    onSubmitOrder,
    isSubmitting = false,
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
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="btn-submit-order"
                    disabled={cartItems.length === 0 || isSubmitting}
                    onClick={onSubmitOrder}
                >
                    {isSubmitting ? (
                        <span className="btn-loading-content">
                            <Loader2 size={18} className="spinner" /> Đang gửi nhà bếp...
                        </span>
                    ) : (
                        'Gửi nhà bếp'
                    )}
                </Button>
            </div>
        </div>
    );
};

export default CartSidebar;