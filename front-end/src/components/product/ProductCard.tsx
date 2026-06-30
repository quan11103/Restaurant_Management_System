import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { type Product } from '../../types';
import RatingStars from './RatingStars';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <a href={`/product/${product.id}`} className="product-card">
            <div className="product-image-wrapper">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                />
                {product.isPromo && (
                    <span className="promo-badge">Promo</span>
                )}
            </div>

            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>

                {product.rating && (
                    <RatingStars
                        rating={product.rating}
                        size={14}
                        showText={true}
                    />
                )}

                <div className="product-meta">
                    {product.deliveryTime && (
                        <div className="meta-item">
                            <Clock size={14} />
                            <span>{product.deliveryTime}</span>
                        </div>
                    )}
                    {product.distance && (
                        <div className="meta-item">
                            <MapPin size={14} />
                            <span>{product.distance} km</span>
                        </div>
                    )}
                </div>

                <div className="product-price-row">
                    <span className="current-price">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                        <span className="original-price">{formatPrice(product.originalPrice)}</span>
                    )}
                </div>
            </div>
        </a>
    );
};

export default ProductCard;