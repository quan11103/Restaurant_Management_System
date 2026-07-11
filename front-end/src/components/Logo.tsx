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
            <a href="/">
                <img src={src} alt={alt} className="logo-img" />
            </a>
        </div>
    );
};

export default Logo;