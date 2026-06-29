import React from 'react';
import './DecimalNumberInput.css';

// Kế thừa toàn bộ thuộc tính mặc định của HTML Input (như min, step, placeholder...)
// Ngoại trừ 'onChange' sẽ được định nghĩa lại cho gọn gàng hơn.
interface DecimalNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string | number;
    onChange: (value: string) => void;
}

const DecimalNumberInput: React.FC<DecimalNumberInputProps> = ({
    value,
    onChange,
    className = '',
    ...props
}) => {
    return (
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            // Nối class mặc định của component với class được truyền từ bên ngoài vào
            className={`decimal-input-base ${className}`}
            {...props}
        />
    );
};

export default DecimalNumberInput;