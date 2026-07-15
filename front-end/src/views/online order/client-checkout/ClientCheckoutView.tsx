import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axios';
import { useAlert } from '../../../components/Alert';
import { MapPin, Phone, User, Mail, Loader2, Tag } from 'lucide-react';
import PaymentMethodSelector, { type PaymentMethod } from './PaymentMethodSelector';
import './ClientCheckoutView.css';

interface CartItem {
    id: number;
    quantity: number;
    dish: {
        id: number;
        name: string;
        price: number;
    };
}

const ClientCheckoutView: React.FC = () => {
    const { showAlert } = useAlert();
    const navigate = useNavigate();

    const location = useLocation();
    const appliedPromoCode = location.state?.promoCode || null;
    const discountAmount = location.state?.discountAmount || 0;
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subTotal = cartItems.reduce(
        (sum, item) => sum + item.dish.price * item.quantity,
        0
    );
    const finalTotal = Math.max(0, subTotal - discountAmount);

    useEffect(() => {
        const fetchCheckoutData = async () => {
            try {
                setIsLoading(true);
                const cartRes = await axiosClient.get('/cart-item');
                if (Array.isArray(cartRes.data)) {
                    setCartItems(cartRes.data);
                }
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu thanh toán:', error);
                showAlert('error', 'Không thể tải dữ liệu. Vui lòng thử lại sau.', 'Lỗi');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCheckoutData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOrder = async () => {
        if (!formData.fullName || !formData.phone || !formData.address) {
            showAlert('warning', 'Vui lòng điền đầy đủ các thông tin bắt buộc');
            return;
        }

        if (cartItems.length === 0) {
            showAlert('warning', 'Giỏ hàng của bạn đang trống!');
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await axiosClient.post('/orders/client-checkout', {
                ...formData,
                paymentMethod,
                promoCode: appliedPromoCode
            });

            const result = await response.data;

            if (result.success) {
                if (paymentMethod == 'CASH') {
                    showAlert('success', 'Đặt hàng thành công! Vui lòng thanh toán khi nhận hàng');

                    navigate('/order-success', {
                        state: {
                            orderId: result.data.orderId,
                            totalPay: result.data.totalPay,
                            receiverName: formData.fullName,
                            receiverPhone: formData.phone,
                            shippingAddress: formData.address,
                            paymentMethod: paymentMethod
                        }
                    });
                } else {
                    navigate('/order-success2');
                }
            } else {
                showAlert('error', `Lỗi đặt hàng: ${result.message || 'Vui lòng thử lại sau.'}`);
            }
        } catch (error) {
            console.error('Lỗi hệ thống khi đặt hàng:', error);
            showAlert('error', 'Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin" size={40} />
                <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
        );
    }

    return (
        <div className="client-checkout-layout">
            <div className="checkout-header">
                <h2>Thanh toán đơn hàng</h2>
            </div>

            <div className="checkout-content">
                {/* Cột trái: Form thông tin người nhận */}
                <div className="recipient-form-section">
                    <h3>Thông tin người nhận</h3>

                    <div className="form-group">
                        <label><User size={18} /> Họ và tên *</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><Phone size={18} /> Số điện thoại *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label><Mail size={18} /> Email (Không bắt buộc)</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label><MapPin size={18} /> Địa chỉ nhận hàng *</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* Cột phải: Thông tin đơn hàng & thanh toán */}
                <div className="payment-section">
                    {/* Danh sách món ăn */}
                    <div className="order-details-block summary-block">
                        <h3>Tóm tắt đơn hàng</h3>
                        <div className="ordered-items-mini-list">
                            {cartItems.length > 0 ? (
                                cartItems.map((item) => (
                                    <div key={item.id} className="mini-item-row">
                                        <div className="mini-item-info">
                                            <span className="mini-item-name">{item.dish.name}</span>
                                            <span className="mini-item-qty">
                                                {item.dish.price.toLocaleString('vi-VN')} đ &times; {item.quantity}
                                            </span>
                                        </div>
                                        <span className="mini-item-subtotal">
                                            {(item.dish.price * item.quantity).toLocaleString('vi-VN')} đ
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-4">
                                    Không có sản phẩm nào
                                </div>
                            )}
                        </div>

                        {appliedPromoCode && (
                            <div className="summary-row applied-promo-row">
                                <span className="promo-label">
                                    <Tag size={18} /> Mã áp dụng:
                                </span>
                                <span className="promo-value">{appliedPromoCode}</span>
                            </div>
                        )}

                        <div className="summary-row total-row">
                            <span>Tổng thanh toán:</span>
                            <span className="final-price">{finalTotal.toLocaleString('vi-VN')} đ</span>
                        </div>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="checkout-payment-methods">
                        <PaymentMethodSelector
                            selectedMethod={paymentMethod}
                            onSelect={setPaymentMethod}
                        />
                    </div>

                    {/* Nút hành động */}
                    <div className="action-buttons">
                        <button
                            className="btn-pay"
                            onClick={handleOrder}
                            disabled={isSubmitting || cartItems.length === 0}
                            style={{ opacity: (isSubmitting || cartItems.length === 0) ? 0.7 : 1 }}
                        >
                            {isSubmitting ? 'Đang xử lý...' : `Đặt hàng (${finalTotal.toLocaleString('vi-VN')} đ)`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientCheckoutView;