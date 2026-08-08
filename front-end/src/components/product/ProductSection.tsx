import React from 'react';
import { ChevronRight } from 'lucide-react';
import { type Product } from '../../types';
import ProductCard from './ProductCard';
import axiosClient from '../../api/axios'; // Đảm bảo đường dẫn này khớp với cấu trúc thư mục của bạn
import { useAlert } from '../Alert';       // Đảm bảo đường dẫn này khớp với cấu trúc thư mục của bạn
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
    const { showAlert } = useAlert();
    const skeletonArray = Array.from({ length: 12 });

    // Hàm gọi API thêm vào giỏ hàng (mặc định thêm 1 sản phẩm)
    const handleAddToCart = async (product: Product) => {
        try {
            const dishIdNumber = parseInt(String(product.id), 10);

            await axiosClient.post('/cart-item', {
                dishId: dishIdNumber,
                quantity: 1 // Mặc định số lượng là 1 khi thêm từ danh sách ngoài
            });
            showAlert('success', `Đã thêm thành công 1 suất ${product.name} vào giỏ hàng!`);
        } catch (err: any) {
            console.error("Lỗi thêm vào giỏ hàng:", err);
            if (err.response?.status === 401) {
                showAlert('error', 'Vui lòng đăng nhập để thực hiện chức năng này!');
            } else {
                showAlert('error', err.response?.data?.message || 'Không thể thêm món ăn vào giỏ hàng. Vui lòng thử lại!');
            }
        }
    };

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
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={handleAddToCart} // Truyền callback API xuống ProductCard
                        />
                    ))
                )}
            </div>
        </section>
    );
};

export default ProductSection;