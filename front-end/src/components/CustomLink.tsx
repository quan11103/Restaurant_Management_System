import React, { type AnchorHTMLAttributes, type ReactNode } from 'react';
import './CustomLink.css';

interface CustomLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'neutral';
    underline?: 'none' | 'hover' | 'always';
}

const CustomLink: React.FC<CustomLinkProps> = ({
    children,
    variant = 'primary',
    underline = 'hover',
    className = '',
    ...rest
}) => {
    const linkClass = `custom-link link-${variant} underline-${underline} ${className}`;

    return (
        <a className={linkClass.trim()} {...rest}>
            {children}
        </a>
    );
};

export default CustomLink;