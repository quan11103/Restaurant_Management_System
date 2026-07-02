import React from 'react';
import { Minus, Plus } from 'lucide-react';
import './QuantitySelector.css';

interface QuantitySelectorProps {
    value: number;
    onChange: (newValue: number) => void;
    min?: number;
    max?: number;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
    value,
    onChange,
    min = 1,
    max = 99,
    size = 'medium',
    className = ''
}) => {
    const iconSize = size === 'small' ? 14 : size === 'large' ? 18 : 16;

    return (
        <div className={`quantity-controller size-${size} ${className}`.trim()}>
            <button
                type="button"
                className="qty-btn"
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={value <= min}
                aria-label="Giảm số lượng"
            >
                <Minus size={iconSize} />
            </button>

            <span className="qty-number">{value}</span>

            <button
                type="button"
                className="qty-btn"
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={value >= max}
                aria-label="Tăng số lượng"
            >
                <Plus size={iconSize} />
            </button>
        </div>
    );
};

export default QuantitySelector;