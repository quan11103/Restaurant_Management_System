import React, { useState, useEffect } from 'react';
import './ProductImageGallery.css';

interface ProductImageGalleryProps {
    images: string[];
    productName?: string;    // Tên món ăn để làm thẻ alt hỗ trợ SEO
    className?: string;      // Class CSS phụ để tuỳ biến
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
    images,
    productName = 'Hình ảnh món ăn',
    className = ''
}) => {
    // Nếu không có ảnh, dùng một chuỗi rỗng để tránh lỗi
    const defaultImage = images && images.length > 0 ? images[0] : '';
    const [mainImage, setMainImage] = useState(defaultImage);

    // Cập nhật lại ảnh chính nếu prop `images` thay đổi (rất hữu ích khi data từ API trả về chậm)
    useEffect(() => {
        if (images && images.length > 0) {
            setMainImage(images[0]);
        }
    }, [images]);

    if (!images || images.length === 0) {
        return <div className="no-image-placeholder">Chưa có hình ảnh</div>;
    }

    return (
        <section className={`product-image-gallery ${className}`.trim()}>
            {/* Ảnh to ở trên */}
            <div className="main-image-container">
                <img src={mainImage} alt={productName} className="main-view-img" />
            </div>

            {/* Dải ảnh thumbnail ở dưới (Chỉ hiện nếu có nhiều hơn 1 ảnh) */}
            {images.length > 1 && (
                <div className="thumbnail-list">
                    {images.map((imgUrl, idx) => (
                        <div
                            key={idx}
                            className={`thumb-item ${mainImage === imgUrl ? 'active' : ''}`}
                            onClick={() => setMainImage(imgUrl)}
                        >
                            <img src={imgUrl} alt={`${productName} - Góc chụp ${idx + 1}`} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default ProductImageGallery;