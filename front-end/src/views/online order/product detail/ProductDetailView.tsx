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

// Định nghĩa interface cho Review để type-checking chuẩn xác
interface Review {
    id: string;
    user: string;
    rating: number;
    date: string;
    comment: string;
}

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

    // Thêm state lưu reviews thật từ API
    const [reviews, setReviews] = useState<Review[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const response = await axiosClient.get(`/dishes/${id}`);
                if (!response.data) {
                    throw new Error('Không tìm thấy món ăn!');
                }
                setProduct(response.data);
            } catch (err) {
                console.error(err);
                setError('Có lỗi xảy ra khi tải dữ liệu món ăn.');
            }
        };

        const fetchRecommendations = async (currentIdNum: number) => {
            try {
                const token = localStorage.getItem("access_token");
                const body: any = {
                    topK: 8,
                    excludeDishIds: [currentIdNum],
                };

                if (!token) {
                    body.history = [
                        {
                            dishId: currentIdNum,
                            interaction: 1,
                        },
                    ];
                }

                const response = await axiosClient.post("/dishes/recommend", body);
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
                setIsLoading(true);
                setQuantity(1);
                window.scrollTo(0, 0);

                const currentIdNum = parseInt(id, 10);

                await fetchProductDetail();

                if (!isNaN(currentIdNum)) {
                    await Promise.all([
                        fetchRecommendations(currentIdNum),
                    ]);
                }

                setIsLoading(false);
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
    // Dùng trực tiếp độ dài mảng reviews thực tế
    const displayReviewCount = reviews.length > 0 ? reviews.length : (product.reviewCount || 0);

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
                <ProductImageGallery
                    images={sortedImageUrls}
                    productName={product.name}
                />

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

            {/* Truyền trực tiếp state reviews thật vào component */}
            <ReviewSection
                dishId={product.id}
            />

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