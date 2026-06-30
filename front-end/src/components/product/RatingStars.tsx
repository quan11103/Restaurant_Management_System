import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import './RatingStars.css';

interface RatingStarsProps {
    rating: number;
    maxStars?: number;
    size?: number;
    isInteractive?: boolean;
    onChange?: (newRating: number) => void;
    showText?: boolean;
    className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    maxStars = 5,
    size = 16,
    isInteractive = false,
    onChange,
    showText = false,
    className = ""
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    // Xử lý làm tròn điểm số đến 0.5 gần nhất (VD: 4.8 -> 5.0; 4.4 -> 4.5; 4.2 -> 4.0)
    // Nếu đang ở chế độ tương tác và có hover, ưu tiên hiển thị số sao đang hover
    const displayRating = hoverRating > 0 ? hoverRating : Math.round(rating * 2) / 2;

    const renderStars = () => {
        const stars = [];

        for (let i = 1; i <= maxStars; i++) {
            let StarComponent;
            let starClass = "star-icon";

            if (i <= displayRating) {
                StarComponent = <Star size={size} fill="currentColor" strokeWidth={1.5} />;
                starClass += " star-full";
            } else if (i - 0.5 === displayRating) {
                StarComponent = <StarHalf size={size} fill="currentColor" strokeWidth={1.5} />;
                starClass += " star-half";
            } else {
                StarComponent = <Star size={size} strokeWidth={1.5} />;
                starClass += " star-empty";
            }

            stars.push(
                <button
                    key={i}
                    type="button"
                    className={starClass}
                    disabled={!isInteractive}
                    onClick={() => isInteractive && onChange && onChange(i)}
                    onMouseEnter={() => isInteractive && setHoverRating(i)}
                    onMouseLeave={() => isInteractive && setHoverRating(0)}
                    aria-label={`Đánh giá ${i} sao`}
                >
                    {StarComponent}
                </button>
            );
        }

        return stars;
    };

    return (
        <div className={`rating-stars-wrapper ${className}`}>
            <div className={`stars-container ${isInteractive ? 'interactive' : ''}`}>
                {renderStars()}
            </div>
            {showText && (
                <span className="rating-text" style={{ fontSize: `${size * 0.9}px` }}>
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default RatingStars;