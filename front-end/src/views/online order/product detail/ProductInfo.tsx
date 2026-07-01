import React from 'react';
import { Star } from 'lucide-react';
import './ProductInfo.css';

interface ProductInfoProps {
    name: string;
    rating: number;
    reviewCount: number;
    price: number;
    description: string;
    className?: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
    name,
    rating,
    reviewCount,
    price,
    description,
    className = ''
}) => {
    return (
        <div className={`product-info-wrapper ${className}`.trim()}>
            <h1 className="product-title">{name}</h1>

            <div className="meta-rating-row">
                <div className="stars-group">
                    <Star size={16} fill="#f39c12" stroke="#f39c12" />
                    <span className="rating-score">{rating}</span>
                    <span className="reviews-count">({reviewCount} đánh giá từ khách hàng)</span>
                </div>
            </div>

            <div className="price-display-box">
                <span className="current-price">{price.toLocaleString('vi-VN')} đ</span>
                <span className="price-note">/ Phần ăn</span>
            </div>

            <p className="short-desc-text">{description}</p>
        </div>
    );
};

export default ProductInfo;