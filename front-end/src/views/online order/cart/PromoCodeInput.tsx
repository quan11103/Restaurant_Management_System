import React, { useState } from 'react';
import { Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import './PromoCodeInput.css';

interface PromoCodeInputProps {
    onApply: (code: string) => void;
    isLoading?: boolean;
    errorMsg?: string | null;
    successMsg?: string | null;
    className?: string;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
    onApply,
    isLoading = false,
    errorMsg,
    successMsg,
    className = ''
}) => {
    const [code, setCode] = useState('');

    const handleApplyClick = () => {
        const trimmedCode = code.trim();
        if (trimmedCode) {
            onApply(trimmedCode);
        }
    };

    // Cho phép ấn Enter để áp dụng mã
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleApplyClick();
        }
    };

    return (
        <div className={`promo-code-box ${className}`.trim()}>
            <h3 className="promo-box-title">
                <Ticket size={18} /> Khuyến mãi
            </h3>

            <div className="promo-input-group">
                <input
                    type="text"
                    placeholder="Nhập mã giảm giá..."
                    className="promo-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />
                <button
                    className="promo-apply-btn"
                    onClick={handleApplyClick}
                    disabled={isLoading || !code.trim()}
                >
                    {isLoading ? 'Đang thử...' : 'Áp dụng'}
                </button>
            </div>

            {/* Vùng hiển thị thông báo phản hồi */}
            {errorMsg && (
                <div className="promo-message error">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                </div>
            )}

            {successMsg && (
                <div className="promo-message success">
                    <CheckCircle2 size={16} />
                    <span>{successMsg}</span>
                </div>
            )}
        </div>
    );
};

export default PromoCodeInput;