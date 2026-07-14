import React from 'react';
import { Trash2 } from 'lucide-react';
import QuantitySelector from '../../../components/QuantitySelector';

export interface CartItemType {
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (id: number, newQuantity: number) => void;
    onRemove: (id: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
    return (
        <div className="cart-item-row">
            {/* Cột 1: Hình ảnh & thông tin */}
            <div className="cart-item-product-col">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>

                    {/* Giá hiển thị riêng cho mobile (bị ẩn trên Desktop) */}
                    <div className="cart-item-price-mobile">
                        {item.price.toLocaleString('vi-VN')} đ
                    </div>
                </div>
            </div>

            {/* Cột 2: Đơn giá (ẩn trên mobile) */}
            <div className="cart-item-price-col hidden-mobile">
                {item.price.toLocaleString('vi-VN')} đ
            </div>

            {/* Cột 3: Bộ đếm số lượng */}
            <div className="cart-item-qty-col">
                <QuantitySelector
                    value={item.quantity}
                    onChange={(val) => onUpdateQuantity(item.id, val)}
                    max={20}
                    size="small"
                />
            </div>

            {/* Cột 4: Thành tiền (ẩn trên mobile) */}
            <div className="cart-item-total-col hidden-mobile">
                {(item.price * item.quantity).toLocaleString('vi-VN')} đ
            </div>

            {/* Cột 5: Nút xóa */}
            <div className="cart-item-action-col">
                <button
                    className="cart-item-remove-btn"
                    onClick={() => onRemove(item.id)}
                    aria-label="Xóa món"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default CartItem;