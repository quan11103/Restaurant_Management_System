import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axios';
import { useParams } from 'react-router-dom';
import { useAlert } from '../../../components/Alert';
import { ShoppingCart, Loader2 } from 'lucide-react';
import QuantitySelector from '../../../components/QuantitySelector';
import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';
import ReviewSection from './ReviewSection';
import ProductSection from '../../../components/product/ProductSection';
import './ProductDetailView.css';

const MOCK_REVIEWS = [
    { id: 'r1', user: 'Nguyễn Văn A', rating: 5, date: '28/06/2026', comment: 'Món ăn thực sự rất ngon, hợp khẩu vị. Sẽ ủng hộ dài dài!' },
    { id: 'r2', user: 'Trần Thị B', rating: 4, date: '20/06/2026', comment: 'Giao hàng nhanh, đồ ăn đến nơi vẫn còn nóng hổi.' }
];

interface DishDetail {
    id: number;
    name: string;
    price: number;
    description: string;
    images: { imageUrl: string; isMain: boolean }[];
    rating?: number;
    reviewCount?: number;
}

interface MappedProduct {
    id: string;
    name: string;
    price: number;
    rating: number;
    imageUrl: string;
}

const ProductDetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { showAlert } = useAlert();

    const [product, setProduct] = useState<DishDetail | null>(null);
    const [recommendedDishes, setRecommendedDishes] = useState<MappedProduct[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const fetchProductDetail = async () => {
            setIsLoading(true);
            try {
                const response = await axiosClient.get(`/dishes/${id}`);
                if (!response.data) {
                    throw new Error('Không tìm thấy món ăn!');
                }
                setProduct(response.data);
            } catch (err) {
                console.error(err);
                setError('Có lỗi xảy ra khi tải dữ liệu món ăn.');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchRecommendations = async (currentIdNum: number) => {
            try {
                const token = localStorage.getItem("access_token");

                const body: any = {
                    topK: 8,
                    excludeDishIds: [currentIdNum],
                };

                // Chỉ khách chưa đăng nhập mới gửi history
                if (!token) {
                    body.history = [
                        {
                            dishId: currentIdNum,
                            interaction: 1,
                        },
                    ];
                }

                const response = await axiosClient.post(
                    "/dishes/recommend",
                    body
                );

                const recommended = response.data.map((dish: DishDetail) => ({
                    id: dish.id.toString(),
                    name: dish.name,
                    price: dish.price,
                    rating: dish.rating ?? 4.8,
                    imageUrl:
                        dish.images?.find((img) => img.isMain)?.imageUrl ??
                        dish.images?.[0]?.imageUrl ??
                        "https://via.placeholder.com/300x200?text=No+Image",
                }));

                setRecommendedDishes(recommended);
            } catch (err) {
                console.error("Lỗi khi tải danh sách gợi ý:", err);
                setRecommendedDishes([]);
            }
        };

        if (id) {
            const loadData = async () => {
                setQuantity(1);
                window.scrollTo(0, 0);

                await fetchProductDetail();

                const currentIdNum = parseInt(id, 10);

                if (!isNaN(currentIdNum)) {
                    await fetchRecommendations(currentIdNum);
                }
            };

            loadData().catch(console.error);
        }
    }, [id]);

    if (isLoading) return <div className="detail-container">Đang tải dữ liệu...</div>;
    if (error || !product) return <div className="detail-container"><h2>{error || 'Không tìm thấy dữ liệu'}</h2></div>;

    const totalPrice = product.price * quantity;

    const sortedImageUrls = product.images && product.images.length > 0
        ? [...product.images]
            .sort((a, b) => {
                if (a.isMain && !b.isMain) return -1;
                if (!a.isMain && b.isMain) return 1;
                return 0;
            })
            .map(img => img.imageUrl)
        : ['https://via.placeholder.com/600x400?text=No+Image'];

    const displayRating = product.rating || 4.8;
    const displayReviewCount = product.reviewCount || 128;

    const handleAddToCart = async () => {
        setIsSubmitting(true);
        try {
            await axiosClient.post('/cart-item', {
                dishId: product.id,
                quantity: quantity
            });
            showAlert('success', `Đã thêm thành công ${quantity} suất ${product.name} vào giỏ hàng!`);
        } catch (err: any) {
            console.error("Lỗi thêm vào giỏ hàng:", err);
            if (err.response?.status === 401) {
                showAlert('error', 'Vui lòng đăng nhập để thực hiện chức năng này!');
            } else {
                showAlert('error', err.response?.data?.message || 'Không thể thêm món ăn vào giỏ hàng. Vui lòng thử lại!');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="product-detail-view">
            <main className="detail-container main-content-layout">
                {/* Khối trái: gallery */}
                <ProductImageGallery
                    images={sortedImageUrls}
                    productName={product.name}
                />

                {/* Khối phải: thông tin chi tiết */}
                <section className="detail-right-info">
                    <ProductInfo
                        name={product.name}
                        rating={displayRating}
                        reviewCount={displayReviewCount}
                        price={product.price}
                        description={product.description || 'Chưa có mô tả cho món ăn này.'}
                    />

                    <div className="purchase-action-wrapper">
                        <QuantitySelector
                            value={quantity}
                            onChange={setQuantity}
                            max={10}
                            size='large'
                        />

                        <button
                            className="add-to-cart-action-btn"
                            onClick={handleAddToCart}
                            type="button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <ShoppingCart size={20} />
                            )}
                            <span>
                                {isSubmitting ? 'Đang thêm...' : `Thêm Vào Giỏ - ${totalPrice.toLocaleString('vi-VN')} đ`}
                            </span>
                        </button>
                    </div>
                </section>
            </main>

            <ReviewSection
                reviews={MOCK_REVIEWS}
                reviewCount={displayReviewCount}
            />

            {/* Sản phẩm gợi ý */}
            {recommendedDishes.length > 0 && (
                <section className="home-section detail-container">
                    <ProductSection
                        title="Gợi ý dành riêng cho bạn"
                        subtitle="Dựa trên sở thích và xu hướng đặt món hiện tại"
                        products={recommendedDishes as any}
                        isLoading={isLoading}
                    />
                </section>
            )}
        </div>
    );
};

export default ProductDetailView;