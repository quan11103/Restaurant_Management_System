import React, { useState } from 'react';
import { ShoppingBag, ArrowLeft, Ticket } from 'lucide-react';
import EmptyState from '../../../components/EmptyState';
import CartItemList from './CartItemList';
import CartItem from './CartItem';
import PromoCodeInput from './PromoCodeInput';
import OrderSummary from './OrderSummary';
import './CartView.css';

const MOCK_CART_ITEMS = [
    {
        id: 'item-1',
        name: 'Phở Đuôi Bò Thượng Hạng Hòa Hảo',
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=200&auto=format&fit=crop',
        options: 'Size Lớn, Thêm trứng chần, Ít bánh phở',
        price: 115000,
        quantity: 2
    },
    {
        id: 'item-2',
        name: 'Nem Rán Hà Nội (Phần 3 cuốn)',
        image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?q=80&w=200&auto=format&fit=crop',
        options: 'Nước mắm chua ngọt',
        price: 45000,
        quantity: 1
    }
];

const CartView: React.FC = () => {
    const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);

    const [promoError, setPromoError] = useState<string | null>(null);
    const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
    const [isCheckingPromo, setIsCheckingPromo] = useState(false);

    const [discountAmount, setDiscountAmount] = useState(0);

    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = subtotal > 0 ? 15000 : 0; // Phí ship tượng trưng 15k
    const total = subtotal + shippingFee;

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        ));
    };

    const handleRemoveItem = (id: string) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const handleApplyPromo = (code: string) => {
        setIsCheckingPromo(true);
        setPromoError(null);
        setPromoSuccess(null);

        // Giả lập gọi API kiểm tra mã
        setTimeout(() => {
            setIsCheckingPromo(false);
            if (code === 'HOAHAO2026') {
                setPromoSuccess('Áp dụng thành công! Giảm 10% tổng đơn.');
                // (Tính toán lại state giảm giá ở đây)
            } else {
                setPromoError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
            }
        }, 1000);
    };

    const handleProceedToCheckout = () => {
        // Logic chuyển hướng sang trang thanh toán hoặc mở popup
        console.log('Đang chuyển hướng sang trang thanh toán...');
        // window.location.href = '/checkout';
    };

    return (
        <div className="cart-view-page">
            <main className="cart-main-container">
                <div className="cart-header-wrapper">
                    <h1 className="cart-page-title">
                        <ShoppingBag size={28} className="title-icon" />
                        Giỏ hàng của bạn
                    </h1>
                </div>

                {cartItems.length === 0 ? (
                    <EmptyState
                        icon={<ShoppingBag size={48} strokeWidth={1.5} />}
                        title="Giỏ hàng đang trống"
                        message={`Có vẻ như bạn chưa chọn món nào.\nHãy khám phá thực đơn hấp dẫn của Hòa Hảo nhé!`}
                        actionText="Xem Thực Đơn Ngay"
                        actionHref="/menu"
                    />
                ) : (
                    /* --- BỐ CỤC GIỎ HÀNG (2 CỘT) --- */
                    <div className="cart-content-layout">

                        {/* CỘT TRÁI: DANH SÁCH MÓN ĂN */}
                        <div className="cart-items-column">
                            <CartItemList>
                                {cartItems.map(item => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemove={handleRemoveItem}
                                    />
                                ))}
                            </CartItemList>
                        </div>

                        {/* CỘT PHẢI: TỔNG KẾT & KHUYẾN MÃI */}
                        <div className="cart-summary-column">

                            <PromoCodeInput
                                onApply={handleApplyPromo}
                                isLoading={isCheckingPromo}
                                errorMsg={promoError}
                                successMsg={promoSuccess}
                            />

                            <OrderSummary
                                itemCount={totalQuantity}
                                subtotal={subtotal}
                                shippingFee={shippingFee}
                                discount={discountAmount}
                                onCheckout={handleProceedToCheckout}
                            />

                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CartView;