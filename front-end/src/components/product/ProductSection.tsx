import React from 'react';
import { ChevronRight } from 'lucide-react';
import { type Product } from '../../types';
import ProductCard from './ProductCard';
import './ProductSection.css';

interface ProductSectionProps {
    title?: string;
    subtitle?: string;
    products: Product[];
    isLoading?: boolean;
    onViewAllClick?: () => void;
    className?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({
    title,
    subtitle,
    products,
    isLoading = false,
    onViewAllClick,
    className = ''
}) => {
    const skeletonArray = Array.from({ length: 12 });

    return (
        <section className={`product-section ${className}`}>
            <div className="section-header">
                <div className="section-title-group">
                    <h2 className="section-title">{title}</h2>
                    {subtitle && <p className="section-subtitle">{subtitle}</p>}
                </div>

                {onViewAllClick && (
                    <button className="view-all-btn" onClick={onViewAllClick}>
                        <span>Xem tất cả</span>
                        <ChevronRight size={18} />
                    </button>
                )}
            </div>

            <div className="product-grid">
                {isLoading ? (
                    skeletonArray.map((_, index) => (
                        <div className="product-card skeleton-card" key={`skel-${index}`}>
                            <div className="skeleton-image"></div>
                            <div className="skeleton-text title"></div>
                            <div className="skeleton-text short"></div>
                            <div className="skeleton-text price"></div>
                        </div>
                    ))
                ) : (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                )}
            </div>
        </section>
    );
};

export default ProductSection;