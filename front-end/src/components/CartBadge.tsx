import React from 'react';
import { ShoppingCart } from 'lucide-react';
import './CartBadge.css';

interface CartBadgeProps {
    itemCount: number;
    onClick?: () => void;
    className?: string;
    size?: number;
}

const CartBadge: React.FC<CartBadgeProps> = ({
    itemCount,
    onClick,
    className = "",
    size = 24
}) => {
    const displayCount = itemCount > 99 ? '99+' : itemCount;

    return (
        <button
            className={`cart-badge-btn ${className}`}
            onClick={onClick}
            aria-label={`Giỏ hàng của bạn có ${itemCount} món`}
        >
            <div className="cart-badge-wrapper">
                <ShoppingCart size={size} />

                {itemCount > 0 && (
                    <span className="cart-badge-count">
                        {displayCount}
                    </span>
                )}
            </div>
        </button>
    );
};

export default CartBadge;