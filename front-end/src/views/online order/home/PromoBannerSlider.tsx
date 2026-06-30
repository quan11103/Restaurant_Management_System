import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './PromoBannerSlider.css';

interface Banner {
    id: number | string;
    imageUrl: string;
    link: string;
    title?: string;
}

interface PromoBannerSliderProps {
    banners: Banner[];
    isLoading?: boolean;
    autoPlayTime?: number;
}

const PromoBannerSlider: React.FC<PromoBannerSliderProps> = ({
    banners,
    isLoading = false,
    autoPlayTime = 4000
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        if (banners.length === 0) return;
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, [banners.length]);

    const prevSlide = () => {
        if (banners.length === 0) return;
        setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    // Thiết lập thời gian tự động chạy slide
    useEffect(() => {
        if (isLoading || banners.length <= 1) return;

        const slideInterval = setInterval(nextSlide, autoPlayTime);

        // Dọn dẹp interval khi component unmount hoặc dữ liệu thay đổi
        return () => clearInterval(slideInterval);
    }, [isLoading, banners, nextSlide, autoPlayTime]);

    if (isLoading || banners.length === 0) {
        return <div className="banner-slider-skeleton"></div>;
    }

    return (
        <div className="banner-slider-container">
            <div
                className="banner-slides-wrapper"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner) => (
                    <div className="banner-slide" key={banner.id}>
                        <a href={banner.link} className="banner-link">
                            <img
                                src={banner.imageUrl}
                                alt={banner.title || "Promotional Banner"}
                                className="banner-image"
                                loading="lazy"
                            />
                        </a>
                    </div>
                ))}
            </div>

            {banners.length > 1 && (
                <>
                    <button className="slider-arrow arrow-left" onClick={prevSlide} aria-label="Previous slide">
                        <ChevronLeft size={24} />
                    </button>
                    <button className="slider-arrow arrow-right" onClick={nextSlide} aria-label="Next slide">
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {banners.length > 1 && (
                <div className="slider-dots">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            className={`dot-item ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        ></button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PromoBannerSlider;