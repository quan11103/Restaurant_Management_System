import React, { type ReactNode } from 'react';
import './Badge.css';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    return (
        <span className={`global-badge badge-${variant} ${className}`.trim()}>
            {children}
        </span>
    );
};

export default Badge;