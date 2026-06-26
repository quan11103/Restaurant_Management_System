import React from 'react';
import './Logo.css';

interface LogoProps {
    className?: string;
    src?: string;
    alt?: string;
}

const Logo: React.FC<LogoProps> = ({
    className = '',
    src = '/logo.png',
    alt = 'Nhà hàng Hòa Hảo'
}) => {
    return (
        <div className={`logo-container ${className}`.trim()}>
            <img src={src} alt={alt} className="logo-img" />
        </div>
    );
};

export default Logo;