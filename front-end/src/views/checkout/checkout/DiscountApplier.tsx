import React, { useState } from 'react';
import { Tag, CheckCircle2, XCircle, Trash2, Loader2 } from 'lucide-react';
import './DiscountApplier.css';

export interface PromotionModel {
    id: number;
    code: string;
    type: 'FIXED' | 'PERCENTAGE';
    value: number;
    minOrderValue: number | null;
    maxDiscount: number | null;
    startDate: string;
    endDate: string;
    usageLimit: number | null;
    usedCount: number;
}

const MOCK_PROMOTIONS: PromotionModel[] = [
    {
        id: 1, code: 'GIAM50K', type: 'FIXED', value: 50000,
        minOrderValue: 200000, maxDiscount: null,
        startDate: '2026-01-01T00:00:00Z', endDate: '2026-12-31T23:59:59Z',
        usageLimit: 100, usedCount: 10
    },
    {
        id: 2, code: 'SALE10', type: 'PERCENTAGE', value: 10,
        minOrderValue: 100000, maxDiscount: 30000,
        startDate: '2026-06-01T00:00:00Z', endDate: '2026-07-31T23:59:59Z',
        usageLimit: null, usedCount: 50
    }
];

export interface AppliedDiscount {
    promotionId: number;
    code: string;
    discountAmount: number;
}

interface DiscountApplierProps {
    orderTotal: number;
    appliedDiscount: AppliedDiscount | null;
    onApply: (discount: AppliedDiscount) => void;
    onRemove: () => void;
}

const DiscountApplier: React.FC<DiscountApplierProps> = ({
    orderTotal,
    appliedDiscount,
    onApply,
    onRemove
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleApply = () => {
        if (!inputValue.trim()) return;

        setIsLoading(true);
        setErrorMsg(null);

        // Giả lập độ trễ gọi API xuống backend
        setTimeout(() => {
            const promo = MOCK_PROMOTIONS.find(p => p.code === inputValue.trim().toUpperCase());
            const now = new Date();

            if (!promo) {
                setErrorMsg('Mã khuyến mãi không tồn tại.');
                setIsLoading(false);
                return;
            }

            if (now < new Date(promo.startDate) || now > new Date(promo.endDate)) {
                setErrorMsg('Mã khuyến mãi đã hết hạn hoặc chưa đến thời gian áp dụng.');
                setIsLoading(false);
                return;
            }

            if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
                setErrorMsg('Mã khuyến mãi đã hết lượt sử dụng.');
                setIsLoading(false);
                return;
            }

            if (promo.minOrderValue !== null && orderTotal < promo.minOrderValue) {
                setErrorMsg(`Đơn hàng cần đạt tối thiểu ${promo.minOrderValue.toLocaleString('vi-VN')} đ.`);
                setIsLoading(false);
                return;
            }

            let calculatedDiscount = 0;
            if (promo.type === 'FIXED') {
                calculatedDiscount = promo.value;
            } else if (promo.type === 'PERCENTAGE') {
                calculatedDiscount = (orderTotal * promo.value) / 100;
                if (promo.maxDiscount !== null && calculatedDiscount > promo.maxDiscount) {
                    calculatedDiscount = promo.maxDiscount;
                }
            }

            calculatedDiscount = Math.min(calculatedDiscount, orderTotal);

            // Thành công, đẩy dữ liệu lên component cha
            onApply({
                promotionId: promo.id,
                code: promo.code,
                discountAmount: calculatedDiscount
            });

            setInputValue('');
            setIsLoading(false);
        }, 600); // Đợi 600ms
    };

    // Giao diện khi đã áp dụng mã
    if (appliedDiscount) {
        return (
            <div className="discount-applied-container">
                <div className="discount-success-info">
                    <CheckCircle2 size={20} className="success-icon" />
                    <div>
                        <span className="promo-code-badge">{appliedDiscount.code}</span>
                        <span className="promo-amount">
                            - {appliedDiscount.discountAmount.toLocaleString('vi-VN')} đ
                        </span>
                    </div>
                </div>
                <button className="btn-remove-promo" onClick={onRemove} title="Gỡ mã khuyến mãi">
                    <Trash2 size={18} />
                </button>
            </div>
        );
    }

    // Giao diện khi chưa áp dụng mã
    return (
        <div className="discount-applier-container">
            <div className="promo-input-wrapper">
                <Tag size={18} className="promo-icon" />
                <input
                    type="text"
                    placeholder="Nhập mã khuyến mãi..."
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value.toUpperCase());
                        setErrorMsg(null); // Xóa lỗi khi user gõ lại
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                    disabled={isLoading}
                />
                <button
                    className="btn-apply-promo"
                    onClick={handleApply}
                    disabled={!inputValue.trim() || isLoading}
                >
                    {isLoading ? <Loader2 size={18} className="spinner" /> : 'Áp dụng'}
                </button>
            </div>

            {errorMsg && (
                <div className="promo-error-msg">
                    <XCircle size={14} />
                    <span>{errorMsg}</span>
                </div>
            )}
        </div>
    );
};

export default DiscountApplier;