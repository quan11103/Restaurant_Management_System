import React, { type InputHTMLAttributes, useId } from 'react';
import './InputField.css';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    errorMessage?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    errorMessage,
    className = '',
    id,
    ...rest
}) => {
    // Sử dụng Hook useId của React để tự động sinh id duy nhất nếu client không truyền id vào
    const defaultId = useId();
    const inputId = id || defaultId;

    return (
        <div className="input-group">
            {label && (
                // Dùng htmlFor trùng với id của input để tăng trải nghiệm click
                <label htmlFor={inputId} className="input-label">
                    {label}
                </label>
            )}

            <input
                id={inputId}
                className={`input-field ${errorMessage ? 'input-error' : ''} ${className}`}
                aria-invalid={!!errorMessage} // Báo hiệu trạng thái lỗi cho các thiết bị hỗ trợ
                {...rest}
            />

            {errorMessage && <span className="input-error-message">{errorMessage}</span>}
        </div>
    );
};

export default InputField;