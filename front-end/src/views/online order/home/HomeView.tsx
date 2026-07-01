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
    { id: 'c1', name: 'Đồ ăn nhanh', imageUrl: 'https://www.cet.edu.vn/wp-content/uploads/2019/04/fastfood-la-gi.jpg', link: '/menu?category=fastfood' },
    { id: 'c2', name: 'Trà sữa', imageUrl: 'https://congthucphache.com/wp-content/uploads/2023/09/Tra-sua-truyen-thong.png', link: '/menu?category=milktea' },
    { id: 'c3', name: 'Cơm văn phòng', imageUrl: 'https://in.pito.vn/wp-content/uploads/2023/03/Thuc-don-com-van-phong-mon-chay-rau-cu-kho-PITO-Cloud-Canteen.webp', link: '/menu?category=rice' },
    { id: 'c4', name: 'Đồ ăn vặt', imageUrl: 'https://nbtlogistics.vn/public/upload/do-an-vat-noi-dia-trung-quoc-4.jpg?1730189261532', link: '/menu?category=snack' },
    { id: 'c5', name: 'Món tráng miệng', imageUrl: 'https://riversidepalace.vn/newsmultidata/1-873.jpg', link: '/menu?category=cake' },
    { id: 'c6', name: 'Đồ chay', imageUrl: 'https://kingfoodmart.com/_next/image?url=https%3A%2F%2Fstorage.googleapis.com%2Fsc_pcm_product%2Fprod%2F2024%2F6%2F21%2F413919-8.6_o_chay_cac_loai.png&w=256&q=75', link: '/menu?category=vegan' },
];

const MOCK_BEST_SELLERS = [
    { id: 'f1', name: 'Gà rán giòn cay', price: 45000, rating: 4.8, imageUrl: 'https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/kien-thuc/cach-lam-ga-ran-sot-cay-han-quoc/cach-lam-ga-ran-sot-cay-han-quoc-5.jpg' },
    { id: 'f2', name: 'Trà sữa trân châu đường đen', price: 35000, rating: 4.9, imageUrl: 'https://mixuediemdien.com/wp-content/uploads/2024/03/Sua-tuoi-tran-chau-duong-den-600x600.jpg' },
    { id: 'f3', name: 'Pizza hải sản (Size M)', price: 129000, rating: 4.7, imageUrl: 'https://cdn.tgdd.vn/2020/09/CookProduct/1200bzhspm-1200x676.jpg' },
    { id: 'f4', name: 'Burger bò phô mai', price: 55000, rating: 4.5, imageUrl: 'https://burgerking.vn/media/catalog/product/cache/1/image/1800x/040ec09b1e35df139433887a97daa66f/e/x/exc_whopper_2.jpg' },
];

const HomeView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Giả lập độ trễ gọi API từ backend (Ví dụ: fetch danh sách món)
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
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
                            products={MOCK_BEST_SELLERS}
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