import React from 'react';
import './OrderSummaryBox.css';

interface OrderSummaryBoxProps {
    subTotal: number;
    shippingFee: number;
    discount?: number; // Có thể không có mã giảm giá
    totalPay: number;
    className?: string; // Dùng để ghi đè hoặc thêm margin/padding từ component cha
}

export default function OrderSummaryBox({
    subTotal,
    shippingFee,
    discount = 0,
    totalPay,
    className = ''
}: OrderSummaryBoxProps) {
    // Hàm định dạng tiền tệ VNĐ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className={`summary-box-container ${className}`}>
            <h4 className="summary-box-title">Tổng quan đơn hàng</h4>

            <div className="summary-box-content">
                <div className="summary-row">
                    <span className="summary-label">Tạm tính</span>
                    <span className="summary-value">{formatCurrency(subTotal)}</span>
                </div>

                <div className="summary-row">
                    <span className="summary-label">Phí vận chuyển</span>
                    <span className="summary-value">{formatCurrency(shippingFee)}</span>
                </div>

                {/* Chỉ hiển thị dòng giảm giá nếu có giảm giá > 0 */}
                {discount > 0 && (
                    <div className="summary-row discount-row">
                        <span className="summary-label">Giảm giá</span>
                        <span className="summary-value">- {formatCurrency(discount)}</span>
                    </div>
                )}
            </div>

            <div className="summary-row total-row">
                <span className="summary-label">Tổng tiền</span>
                <div className="summary-total-container">
                    <span className="summary-total-value">{formatCurrency(totalPay)}</span>
                </div>
            </div>
        </div>
    );
}