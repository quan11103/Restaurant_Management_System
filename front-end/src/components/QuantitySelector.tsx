import React from 'react';
import { Minus, Plus } from 'lucide-react';
import './QuantitySelector.css';

interface QuantitySelectorProps {
    value: number;                        // Giá trị số lượng hiện tại
    onChange: (newValue: number) => void; // Hàm gọi ngược (callback) khi thay đổi số lượng
    min?: number;                         // Số lượng tối thiểu (mặc định: 1)
    max?: number;                         // Số lượng tối đa (mặc định: 99)
    className?: string;                   // Class phụ nếu muốn custom từ bên ngoài
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
    value,
    onChange,
    min = 1,
    max = 99,
    className = ''
}) => {
    return (
        <div className={`quantity-controller ${className}`.trim()}>
            <button
                type="button"
                className="qty-btn"
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={value <= min}
                aria-label="Giảm số lượng"
            >
                <Minus size={16} />
            </button>

            <span className="qty-number">{value}</span>

            <button
                type="button"
                className="qty-btn"
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={value >= max}
                aria-label="Tăng số lượng"
            >
                <Plus size={16} />
            </button>
        </div>
    );
};

export default QuantitySelector;