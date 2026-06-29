import React from 'react';
import { Receipt } from 'lucide-react';
import './GoodsBillSummary.css';

interface GoodsBillSummaryProps {
    totalAmount: number;
    discount?: number;
}

const GoodsBillSummary: React.FC<GoodsBillSummaryProps> = ({
    totalAmount,
    discount = 0
}) => {
    const finalAmount = Math.max(0, totalAmount - discount);

    return (
        <div className="gb-summary-card">
            <h3 className="summary-title">
                <Receipt size={18} className="text-info" />
                Tổng kết phiếu nhập
            </h3>

            <div className="summary-body">
                <div className="summary-row">
                    <span className="summary-label">Tổng tiền hàng:</span>
                    <span className="summary-value font-medium">
                        {totalAmount.toLocaleString('vi-VN')} đ
                    </span>
                </div>

                {discount > 0 && (
                    <div className="summary-row text-discount">
                        <span className="summary-label">Chiết khấu:</span>
                        <span className="summary-value font-medium">
                            - {discount.toLocaleString('vi-VN')} đ
                        </span>
                    </div>
                )}

                <div className="summary-divider"></div>

                <div className="summary-row summary-total">
                    <span className="summary-label">Cần thanh toán:</span>
                    <span className="summary-value text-highlight">
                        {finalAmount.toLocaleString('vi-VN')} đ
                    </span>
                </div>
            </div>
        </div>
    );
};

export default GoodsBillSummary;