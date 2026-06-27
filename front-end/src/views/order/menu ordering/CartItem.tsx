import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { type CartItem as CartItemType } from './MenuOrderingView';
import './CartItem.css';

interface CartItemProps {
    item: CartItemType;
    onIncrease: (cartItemId: string) => void;
    onDecrease: (cartItemId: string) => void;
    onRemove: (cartItemId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onIncrease, onDecrease, onRemove }) => {
    return (
        <div className="cart-item">
            <div className="cart-item-info">
                <strong>{item.name}</strong>
                <span className="cart-item-price">{(item.price * item.quantity).toLocaleString()} đ</span>
            </div>

            <div className="cart-item-actions">
                <div className="qty-control">
                    <button
                        className="qty-btn"
                        onClick={() => onDecrease(item.cartItemId)}
                        disabled={item.quantity <= 1} // Không cho giảm dưới 1
                    >
                        <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => onIncrease(item.cartItemId)}>
                        <Plus size={14} />
                    </button>
                </div>
                <button className="delete-btn" onClick={() => onRemove(item.cartItemId)}>
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export default CartItem;