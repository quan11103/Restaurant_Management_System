import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...rest
}) => {
    const buttonClass = `btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''} ${className}`;

    return (
        <button className={buttonClass.trim()} {...rest}>
            {children}
        </button>
    );
};

export default Button;