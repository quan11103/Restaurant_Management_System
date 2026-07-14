import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Loader2 } from 'lucide-react';
import axiosClient from '../../../api/axios';
import EmptyState from '../../../components/EmptyState';
import ConfirmModal from '../../../components/ConfirmModal';
import CartItemList from './CartItemList';
import CartItem from './CartItem';
import PromoCodeInput from './PromoCodeInput';
import OrderSummary from './OrderSummary';
import './CartView.css';

interface ICartItemUI {
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

const CartView: React.FC = () => {
    const [cartItems, setCartItems] = useState<ICartItemUI[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
    const [isCheckingPromo, setIsCheckingPromo] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);

    const navigate = useNavigate();

    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = subtotal > 0 ? 0 : 0;

    const transformCartData = (backendItems: any[]): ICartItemUI[] => {
        return backendItems.map(item => {
            const mainImage = item.dish?.images?.find((img: any) => img.isMain)?.imageUrl
                || item.dish?.images?.[0]?.imageUrl
                || 'https://via.placeholder.com/200?text=No+Image';

            return {
                id: item.id,
                name: item.dish?.name || 'Món ăn',
                image: mainImage,
                price: item.dish?.price || 0,
                quantity: item.quantity
            };
        });
    };

    const resetPromotionState = () => {
        setDiscountAmount(0);
        setPromoSuccess(null);
        setPromoError(null);
        setAppliedPromoCode(null);
    };

    const handleRequestRemove = (id: number) => {
        setDeleteItemId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteItemId) return;

        try {
            await axiosClient.delete(`/cart-item/${deleteItemId}`);
            setCartItems(prev => prev.filter(item => item.id !== deleteItemId));
            resetPromotionState();
        } catch (err) {
            console.error('Lỗi khi xóa món ăn:', err);
            alert('Xóa thất bại. Vui lòng thử lại!');
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteItemId(null);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    const handleUpdateQuantity = async (id: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        try {
            await axiosClient.patch(`/cart-item/${id}`, { quantity: newQuantity });
            setCartItems(prev =>
                prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
            );
            resetPromotionState();
        } catch (err) {
            console.error('Lỗi cập nhật số lượng:', err);
            alert('Không thể cập nhật số lượng. Vui lòng thử lại!');
        }
    };

    const handleApplyPromo = async (code: string) => {
        if (!code.trim()) {
            setPromoError('Vui lòng nhập mã khuyến mãi.');
            return;
        }

        setIsCheckingPromo(true);
        setPromoError(null);
        setPromoSuccess(null);

        try {
            const response = await axiosClient.get(`/promotions/code/${code}?total=${subtotal}`);

            const data = response.data;
            setDiscountAmount(data.discountAmount);
            setAppliedPromoCode(data.code);
            setPromoSuccess(`Áp dụng thành công! Giảm ${data.discountAmount.toLocaleString('vi-VN')} đ`);

        } catch (err: any) {
            console.error('Lỗi khi áp dụng mã:', err);
            const errorMessage = err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
            setPromoError(errorMessage);
            setDiscountAmount(0);
            setAppliedPromoCode(null);
        } finally {
            setIsCheckingPromo(false);
        }
    };

    const handleProceedToCheckout = () => {
        console.log('Đang chuyển hướng sang trang thanh toán...');
        navigate('/client-checkout', {
            state: { promoCode: appliedPromoCode, discountAmount: discountAmount }
        });
    };

    const fetchCartItems = async () => {
        try {
            setIsLoading(true);
            const response = await axiosClient.get('/cart-item');
            setCartItems(transformCartData(response.data));
            setError(null);
        } catch (err) {
            console.error('Lỗi khi lấy giỏ hàng:', err);
            setError('Không thể tải giỏ hàng. Vui lòng thử lại sau!');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="cart-view-page flex items-center justify-center h-screen">
                <Loader2 size={32} className="animate-spin text-gray-500 mr-2" />
                <span>Đang tải giỏ hàng...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart-view-page flex items-center justify-center h-screen text-red-500">
                <p>{error}</p>
            </div>
        );
    }

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
                        actionHref="/"
                    />
                ) : (
                    <div className="cart-content-layout">
                        <div className="cart-items-column">
                            <CartItemList>
                                {cartItems.map(item => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemove={handleRequestRemove}
                                    />
                                ))}
                            </CartItemList>
                        </div>

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
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Xác nhận xóa món ăn"
                message="Bạn có chắc chắn muốn xóa món này khỏi giỏ hàng?"
                confirmLabel="Xóa"
                cancelLabel="Hủy"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteItemId(null);
                }}
            />
        </div>
    );
};

export default CartView;