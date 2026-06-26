import React from 'react';
import { ChevronDown } from 'lucide-react';
import './SelectBox.css';

export interface SelectOption {
    label: string;
    value: string | number;
}

interface SelectBoxProps {
    label?: string;
    options: SelectOption[];
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
}

const SelectBox: React.FC<SelectBoxProps> = ({
    label,
    options,
    value,
    onChange,
    placeholder,
    error,
    disabled = false,
    className = ''
}) => {
    return (
        <div className={`selectbox-wrapper ${className}`.trim()}>
            {label && <label className="selectbox-label">{label}</label>}

            <div className="selectbox-container">
                <select
                    className={`selectbox-input ${error ? 'is-error' : ''}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                >
                    {placeholder && (
                        <option value="" disabled hidden>
                            {placeholder}
                        </option>
                    )}

                    {options.map((opt, index) => (
                        <option key={index} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                <ChevronDown className="selectbox-icon" size={16} />
            </div>

            {error && <span className="selectbox-error-text">{error}</span>}
        </div>
    );
};

export default SelectBox;