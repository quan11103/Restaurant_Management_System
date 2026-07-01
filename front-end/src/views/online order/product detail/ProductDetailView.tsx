import React, { useState } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import CustomerHeader from '../../../components/CustomerHeader';
import CustomerFooter from '../../../components/CustomerFooter';
import QuantitySelector from '../../../components/QuantitySelector';
import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';
import ReviewSection from './ReviewSection';
import './ProductDetailView.css';

const MOCK_PRODUCT = {
    id: 'pho-01',
    name: 'Phở Đuôi Bò Thượng Hạng Hòa Hảo',
    basePrice: 85000,
    rating: 4.8,
    reviewCount: 128,
    likes: 342,
    prepTime: '10 - 15 phút',
    description: 'Món ăn làm nên tên tuổi của nhà hàng Hòa Hảo. Nước dùng được ninh từ xương ống bò kèm thảo mộc trong 24 giờ tạo vị ngọt thanh sâu sắc. Đuôi bò tơ chọn lọc ninh nhừ tan trong miệng, ăn kèm bánh phở tươi tráng tay đặc biệt.',
    images: [
        'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1625398407796-82650a8c135f?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1547928576-a4a33234bed7?q=80&w=600&auto=format&fit=crop'
    ],
    reviews: [
        { id: 'r1', user: 'Nguyễn Văn A', rating: 5, date: '28/06/2026', comment: 'Nước dùng phở Hòa Hảo thực sự đỉnh sắc, ngọt xương chứ không bị nồng mì chính. Đuôi bò béo ngậy, quẩy giòn tan. Sẽ ủng hộ dài dài!' },
        { id: 'r2', user: 'Trần Thị B', rating: 4, date: '20/06/2026', comment: 'Giao hàng nhanh, nước lèo đến nơi vẫn còn nóng hổi. Điểm trừ nhỏ là size lớn ăn hơi nhiều so với sức của mình haha.' }
    ]
};

const ProductDetailView: React.FC = () => {
    const [quantity, setQuantity] = useState(1);

    const totalPrice = MOCK_PRODUCT.basePrice * quantity;

    const handleAddToCart = () => {
        const orderData = {
            productId: MOCK_PRODUCT.id,
            productName: MOCK_PRODUCT.name,
            quantity: quantity,
            finalUnitPrice: MOCK_PRODUCT.basePrice,
            totalPrice: totalPrice
        };
        console.log("Đã thêm món vào Giỏ hàng Hòa Hảo:", orderData);
        alert(`Đã thêm ${quantity} bát ${MOCK_PRODUCT.name} vào giỏ hàng!`);
    };

    return (
        <div className="product-detail-view">
            <CustomerHeader />

            <main className="detail-container main-content-layout">
                {/* Khối trái: gallery */}
                <ProductImageGallery
                    images={MOCK_PRODUCT.images}
                    productName={MOCK_PRODUCT.name}
                />

                {/* Khối phải: thông tin chi tiết */}
                <section className="detail-right-info">
                    <ProductInfo
                        name={MOCK_PRODUCT.name}
                        rating={MOCK_PRODUCT.rating}
                        reviewCount={MOCK_PRODUCT.reviewCount}
                        price={MOCK_PRODUCT.basePrice}
                        description={MOCK_PRODUCT.description}
                    />

                    <div className="purchase-action-wrapper">
                        <QuantitySelector
                            value={quantity}
                            onChange={setQuantity}
                            max={10}
                        />

                        <button className="add-to-cart-action-btn" onClick={handleAddToCart} type="button">
                            <ShoppingCart size={20} />
                            <span>Thêm Vào Giỏ - {totalPrice.toLocaleString('vi-VN')} đ</span>
                        </button>
                    </div>
                </section>
            </main>

            <ReviewSection
                reviews={MOCK_PRODUCT.reviews}
                reviewCount={MOCK_PRODUCT.reviewCount}
            />

            <CustomerFooter />
        </div>
    );
};

export default ProductDetailView;