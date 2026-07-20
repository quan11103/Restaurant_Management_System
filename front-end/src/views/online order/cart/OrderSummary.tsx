import React from 'react';
import './OrderSummary.css';

interface OrderSummaryProps {
    itemCount: number;
    subtotal: number;
    shippingFee?: number;
    discount?: number;
    onCheckout: () => void;
    isCheckoutDisabled?: boolean;
    className?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
    itemCount,
    subtotal,
    shippingFee = 0,
    discount = 0,
    onCheckout,
    isCheckoutDisabled = false,
    className = ''
}) => {
    const total = Math.max(0, subtotal + shippingFee - discount);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' đ';
    };

    return (
        <div className={`order-summary-box ${className}`.trim()}>
            <h3 className="summary-box-title">Tổng kết đơn hàng</h3>

            <div className="summary-content">
                <div className="summary-row">
                    <span className="summary-label">Tạm tính ({itemCount} món)</span>
                    <span className="summary-value">{formatCurrency(subtotal)}</span>
                </div>

                <div className="summary-row">
                    <span className="summary-label">Phí giao hàng</span>
                    <span className="summary-value">{formatCurrency(shippingFee)}</span>
                </div>

                {discount > 0 && (
                    <div className="summary-row discount-row">
                        <span className="summary-label">Khuyến mãi</span>
                        <span className="summary-value">- {formatCurrency(discount)}</span>
                    </div>
                )}

                <div className="summary-row total-row">
                    <span className="summary-label">Tổng cộng</span>
                    <span className="total-amount">{formatCurrency(total)}</span>
                </div>
            </div>

            <button
                className="primary-action-btn checkout-btn"
                onClick={onCheckout}
                disabled={isCheckoutDisabled || itemCount === 0}
            >
                Thanh toán
            </button>
        </div>
    );
};

export default OrderSummary;