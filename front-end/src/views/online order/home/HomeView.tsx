import React, { useState, useEffect } from 'react';
import CustomerHeader from '../../../components/CustomerHeader';
import CustomerFooter from '../../../components/CustomerFooter';
import PromoBannerSlider from './PromoBannerSlider';
import CategoryGrid from './CategoryGrid';
import ProductSection from './ProductSection';
import './HomeView.css';

const MOCK_BANNERS = [
    { id: 1, imageUrl: 'https://res.cloudinary.com/pbermwpj/image/upload/v1782810595/banner1_ezqgdh.png', link: '/promo/1' },
    { id: 2, imageUrl: 'https://res.cloudinary.com/pbermwpj/image/upload/v1782810614/banner2_ulsynz.png', link: '/promo/2' },
];

const MOCK_CATEGORIES = [
    { id: 'c1', name: 'Món chính', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJea-m_K3FixBJ-TbZxkJgfQ2EgqYUNgWy2LmGgOSGITzpuhUUYCVZ4vQ&s=10', link: '/menu?category=fastfood' },
    { id: 'c2', name: 'Pizza', imageUrl: 'https://pizzahut.vn/_next/image?url=https%3A%2F%2Fcdn.pizzahut.vn%2Fimages%2FWeb_V3%2FProducts_MenuTool%2FPesto%20H%E1%BA%A3i%20S%E1%BA%A3n._20250317172201GL5.webp&w=1170&q=75', link: '/menu?category=milktea' },
    { id: 'c3', name: 'Gà rán', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJSH1oVFCBjq13mIjK_Kgy0ixI7bcU-XnPXTCz2hoQFuMgYx2Kbi_K1L9-&s=10', link: '/menu?category=rice' },
    { id: 'c4', name: 'Đồ uống', imageUrl: 'https://congthucphache.com/wp-content/uploads/2023/09/Tra-sua-truyen-thong.png', link: '/menu?category=snack' },
    { id: 'c5', name: 'Cà phê', imageUrl: 'https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2026/6/7/bi-quyet-pha-ca-phe-ngon-10-ly-nhu-scaled-1780833704154867879700.jpg', link: '/menu?category=cake' },
    { id: 'c6', name: 'Tráng miệng', imageUrl: 'https://riversidepalace.vn/newsmultidata/1-873.jpg', link: '/menu?category=vegan' },
];

interface HomeProduct {
    id: string;
    name: string;
    price: number;
    rating: number;
    imageUrl: string;
}

const HomeView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [bestSellers, setBestSellers] = useState<HomeProduct[]>([]);
    const [recommended, setRecommended] = useState<HomeProduct[]>([]);

    useEffect(() => {
        const fetchRandomDishes = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:3000/dishes', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    const data = await response.json();

                    const formattedData: HomeProduct[] = data
                        .filter((item: any) => item.isAvailable !== false)
                        .map((item: any) => {
                            const mainImage = item.images?.find((img: any) => img.isMain === true);

                            let finalImageUrl = 'https://via.placeholder.com/300x200?text=No+Image';
                            if (mainImage) {
                                finalImageUrl = mainImage.imageUrl;
                            } else if (item.images && item.images.length > 0) {
                                finalImageUrl = item.images[0].imageUrl;
                            }

                            return {
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                rating: item.rating || Number((Math.random() * (5 - 4) + 4).toFixed(1)),
                                imageUrl: finalImageUrl
                            };
                        });

                    // Thuật toán xáo trộn mảng ngẫu nhiên (Fisher-Yates Shuffle)
                    for (let i = formattedData.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [formattedData[i], formattedData[j]] = [formattedData[j], formattedData[i]];
                    }

                    setBestSellers(formattedData.slice(0, 4));
                    setRecommended(formattedData.slice(4, 8));
                }
            } catch (error) {
                console.error('Lỗi khi fetch data món ăn trang chủ:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRandomDishes();
    }, []);

    return (
        <div className="home-layout">
            <CustomerHeader cartItemCount={3} />

            <main className="home-main-content">
                <div className="container">
                    <section className="home-section">
                        <PromoBannerSlider banners={MOCK_BANNERS} isLoading={isLoading} />
                    </section>

                    <section className="home-section">
                        <CategoryGrid categories={MOCK_CATEGORIES} isLoading={isLoading} />
                    </section>

                    <section className="home-section">
                        <ProductSection
                            title="Món ngon bán chạy"
                            subtitle="Khám phá các món ăn được yêu thích nhất tuần qua"
                            products={bestSellers}
                            isLoading={isLoading}
                        />
                    </section>

                    <section className="home-section">
                        <ProductSection
                            title="Gợi ý dành riêng cho bạn"
                            subtitle="Dựa trên sở thích và xu hướng đặt món hiện tại"
                            products={recommended}
                            isLoading={isLoading}
                        />
                    </section>
                </div>
            </main>

            <CustomerFooter />
        </div>
    );
};

export default HomeView;