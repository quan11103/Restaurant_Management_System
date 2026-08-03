import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import axiosClient from '../../../api/axios';
import PromoCodeInput from '../../online order/cart/PromoCodeInput';
import PaymentMethodSelector, { type PaymentMethod } from './PaymentMethodSelector';
import BillSummary, { type BillModel } from './BillSummary';
import './CheckoutView.css';

interface OrderedDishDetail {
    id: number;
    price: number;
    quantity: number;
    dish: {
        id: number;
        name: string;
    };
}

interface OrderDetail {
    id: number;
    orderTime: string;
    totalQuantity: number;
    total: number;
    orderedDishes: OrderedDishDetail[];
    bill?: {
        id: number;
        paymentTime: string;
        paymentMethod: string;
        discount: number;
    };
}

interface LocationState {
    tableId?: number;
    tableName?: string;
    orderId?: number;
    promoCode?: string;
    discountAmount?: number;
    userRole?: string;
}

const CheckOutView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = (location.state || {}) as LocationState;

    const { tableId, tableName, orderId, promoCode, discountAmount: initialDiscount } = state;

    const userRole = localStorage.getItem('user_role');
    const isWaiter = userRole === 'WAITER';

    const [orderData, setOrderData] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [showBillSummary, setShowBillSummary] = useState(false);
    const [completedBillData, setCompletedBillData] = useState<BillModel | null>(null);

    const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(promoCode || null);
    const [discountAmount, setDiscountAmount] = useState<number>(initialDiscount || 0);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [promoSuccess, setPromoSuccess] = useState<string | null>(
        promoCode ? `Đã áp dụng mã ${promoCode}` : null
    );
    const [isCheckingPromo, setIsCheckingPromo] = useState<boolean>(false);

    useEffect(() => {
        if (!orderId) {
            setErrorMsg('Không tìm thấy thông tin đơn hàng của bàn này!');
            setIsLoading(false);
            return;
        }

        const fetchOrderDetail = async () => {
            setIsLoading(true);
            try {
                const response = await axiosClient.get(`/orders/${orderId}`);
                setOrderData(response.data);
            } catch (err: any) {
                console.error('Lỗi khi tải chi tiết đơn hàng:', err);
                setErrorMsg('Không thể tải thông tin đơn hàng. Vui lòng thử lại!');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId]);

    const subTotal = orderData?.total || 0;
    const finalTotal = Math.max(0, subTotal - discountAmount);

    const handleApplyPromo = async (code: string) => {
        if (!code.trim()) {
            setPromoError('Vui lòng nhập mã khuyến mãi.');
            return;
        }

        setIsCheckingPromo(true);
        setPromoError(null);
        setPromoSuccess(null);

        try {
            const response = await axiosClient.get(`/promotions/code/${code}?total=${subTotal}`);
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

    const handlePrintBill = () => {
        if (!orderData || !orderData.bill) return;

        const billFromResponse = orderData.bill;
        const cashierName = localStorage.getItem('user_name') || 'Nhân viên thu ngân';

        const formattedBill: BillModel = {
            id: billFromResponse.id,
            orderId: orderData.id,
            paymentTime: billFromResponse.paymentTime,
            paymentMethod: billFromResponse.paymentMethod,
            discount: billFromResponse.discount,
            total: finalTotal,
            cashier: {
                fullName: cashierName
            },
            promotion: appliedPromoCode ? {
                code: appliedPromoCode,
                value: discountAmount,
                type: 'DISCOUNT',
            } : null,
            order: {
                totalQuantity: orderData.totalQuantity,
                orderedDishes: orderData.orderedDishes.map((item: any) => ({
                    id: item.id,
                    dish: item.dish,
                    price: item.price,
                    quantity: item.quantity,
                    subTotal: item.price * item.quantity,
                }))
            }
        };

        setCompletedBillData(formattedBill);
        setShowBillSummary(true);
    };

    const handleCheckout = async () => {
        if (!orderId || !orderData) return;

        setIsSubmitting(true);
        try {
            const response = await axiosClient.post('/orders/staff-checkout', {
                orderId: orderId,
                paymentMethod: paymentMethod,
                discount: discountAmount,
                promotionCode: appliedPromoCode,
            });

            const result = response.data;
            console.log('Checkout response:', result);

            const paymentUrl = result.paymentUrl;

            if (paymentMethod === 'TRANSFER') {
                if (paymentUrl) {
                    window.location.href = paymentUrl;
                    return;
                } else {
                    console.error('Không tìm thấy paymentUrl trong response:', result);
                    alert('Hệ thống không nhận được liên kết thanh toán VNPAY. Vui lòng kiểm tra lại API Backend!');
                    setIsSubmitting(false);
                    return;
                }
            }
        } catch (err: any) {
            console.error('Lỗi khi thanh toán:', err);
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi hoàn tất thanh toán!');
            setIsSubmitting(false);
        }
    };

    const handleCloseBill = () => {
        setShowBillSummary(false);
        setIsSubmitting(false);
    };

    const isTransferMethod = paymentMethod === 'TRANSFER';

    if (isLoading) {
        return <div className="checkout-loading">Đang tải thông tin đơn hàng...</div>;
    }

    if (errorMsg || !orderData) {
        return (
            <div className="checkout-error">
                <p>{errorMsg || 'Không tìm thấy dữ liệu đơn hàng.'}</p>
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Quay lại sơ đồ bàn
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-layout">
            <div className="checkout-header">
                <button className="btn-back-header" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} /> Danh sách bàn
                </button>
                <h2>
                    {isWaiter
                        ? `Chi tiết đơn hàng - ${tableName || 'Bàn chưa xác định'}`
                        : `Thanh toán - ${tableName || 'Bàn chưa xác định'}`}
                </h2>
                <div style={{ width: 80 }}></div>
            </div>

            <div className="checkout-content">
                {/* Cột trái: Chi tiết món ăn trong Order */}
                <div className="order-details-section">
                    <div className="order-meta">
                        <span><strong>Mã đơn:</strong> #{orderData.id}</span>
                        <span>
                            <strong>Thời gian:</strong>{' '}
                            {new Date(orderData.orderTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    <div className="ordered-items-list">
                        <div className="item-header">
                            <span className="col-name">Tên món</span>
                            <span className="col-qty">SL</span>
                            <span className="col-price">Đơn giá</span>
                            <span className="col-subtotal">Thành tiền</span>
                        </div>

                        {orderData.orderedDishes.map((item) => {
                            const itemSubTotal = item.price * item.quantity;
                            return (
                                <div key={item.id} className="item-row">
                                    <span className="col-name">{item.dish.name}</span>
                                    <span className="col-qty">{item.quantity}</span>
                                    <span className="col-price">{item.price.toLocaleString('vi-VN')}</span>
                                    <span className="col-subtotal">{itemSubTotal.toLocaleString('vi-VN')}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Chỉ hiển thị tổng tiền 1 dòng ở cột trái khi người dùng là WAITER */}
                    {isWaiter && (
                        <div className="summary-row total-row" style={{ marginTop: '16px' }}>
                            <span>Tổng tiền ({orderData.totalQuantity} suất):</span>
                            <span className="final-price">{subTotal.toLocaleString('vi-VN')} đ</span>
                        </div>
                    )}
                </div>

                {/* Cột phải: Tính tiền & Phương thức thanh toán (Ẩn hoàn toàn đối với WAITER) */}
                {!isWaiter && (
                    <div className="payment-section">
                        <div className="summary-block">
                            <div className="summary-row">
                                <span>Tổng tiền ({orderData.totalQuantity} suất):</span>
                                <span>{subTotal.toLocaleString('vi-VN')} đ</span>
                            </div>

                            <PromoCodeInput
                                onApply={handleApplyPromo}
                                isLoading={isCheckingPromo}
                                errorMsg={promoError}
                                successMsg={promoSuccess}
                            />

                            <div className="summary-row total-row">
                                <span>Khách cần trả:</span>
                                <span className="final-price">{finalTotal.toLocaleString('vi-VN')} đ</span>
                            </div>
                        </div>

                        <div className="payment-methods">
                            <PaymentMethodSelector
                                selectedMethod={paymentMethod}
                                onSelect={setPaymentMethod}
                            />
                        </div>

                        <div className="action-buttons">
                            {!isTransferMethod && (
                                <button className="btn-print-temp" onClick={handlePrintBill}>
                                    <Printer size={20} />
                                    In hóa đơn
                                </button>
                            )}
                            <button
                                className="btn-pay"
                                onClick={handleCheckout}
                                disabled={isSubmitting}
                                style={{ opacity: isSubmitting ? 0.7 : 1 }}
                            >
                                {isSubmitting
                                    ? (isTransferMethod ? 'Đang chuyển hướng VNPAY...' : 'Đang xử lý...')
                                    : isTransferMethod
                                        ? `Thanh toán`
                                        : `Hoàn tất thanh toán`}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showBillSummary && completedBillData && (
                <BillSummary
                    bill={completedBillData}
                    onClose={handleCloseBill}
                    onPrint={() => {
                        window.print();
                    }}
                />
            )}
        </div>
    );
};

export default CheckOutView;