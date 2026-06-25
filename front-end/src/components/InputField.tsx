import React, { type InputHTMLAttributes } from 'react';
import './InputField.css';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    errorMessage?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    errorMessage,
    className = '',
    ...rest
}) => {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}

            <input
                className={`input-field ${errorMessage ? 'input-error' : ''} ${className}`}
                {...rest}
            />

            {errorMessage && <span className="input-error-message">{errorMessage}</span>}
        </div>
    );
};

export default InputField;