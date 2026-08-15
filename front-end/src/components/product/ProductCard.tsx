import React from 'react';
import { Clock, MapPin, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Product } from '../../types';
import RatingStars from './RatingStars';
import Button from '../Button';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    showCartIcon?: boolean; // Tùy chọn: có thể ẩn thủ công qua prop nếu muốn
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onAddToCart,
    showCartIcon = true
}) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();  // Ngăn chuyển trang
        e.stopPropagation(); // Ngăn nổi bọt sự kiện

        if (onAddToCart) {
            onAddToCart(product);
        }
    };

    return (
        <Link to={`/product/${product.id}`} className="product-card">
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

                {product.rating !== undefined && (
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

                <div className="product-actions">
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={handleAddToCart}
                        className="add-to-cart-btn"
                    >
                        {/* Ẩn bằng prop JS HOẶC ẩn bằng CSS class 'cart-icon' */}
                        {showCartIcon && <ShoppingCart size={18} className="cart-icon" />}
                        <span>Thêm vào giỏ hàng</span>
                    </Button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;