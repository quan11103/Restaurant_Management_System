import React from 'react';
import { Banknote, QrCode, CreditCard } from 'lucide-react';
import './PaymentMethodSelector.css';

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD';

interface PaymentMethodSelectorProps {
    selectedMethod: PaymentMethod;
    onSelect: (method: PaymentMethod) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
    selectedMethod,
    onSelect
}) => {
    return (
        <div className="payment-methods-container">
            <h3>Phương thức thanh toán</h3>
            <div className="method-grid">
                <button
                    className={`method-btn ${selectedMethod === 'CASH' ? 'active' : ''}`}
                    onClick={() => onSelect('CASH')}
                >
                    <Banknote size={24} />
                    Tiền mặt
                </button>

                <button
                    className={`method-btn ${selectedMethod === 'TRANSFER' ? 'active' : ''}`}
                    onClick={() => onSelect('TRANSFER')}
                >
                    <QrCode size={24} />
                    Chuyển khoản
                </button>

                <button
                    className={`method-btn ${selectedMethod === 'CARD' ? 'active' : ''}`}
                    onClick={() => onSelect('CARD')}
                >
                    <CreditCard size={24} />
                    Quẹt thẻ
                </button>
            </div>
        </div>
    );
};

export default PaymentMethodSelector;