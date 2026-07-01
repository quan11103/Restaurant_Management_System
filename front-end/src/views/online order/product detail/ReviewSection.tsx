import React from 'react';
import { Star } from 'lucide-react';
import './ReviewSection.css';

export interface ReviewData {
    id: string;
    user: string;
    rating: number;
    date: string;
    comment: string;
}

interface ReviewSectionProps {
    reviews: ReviewData[];
    reviewCount?: number;
    className?: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
    reviews,
    reviewCount,
    className = ''
}) => {
    // Nếu không truyền reviewCount, mặc định lấy số lượng phần tử của mảng
    const totalReviews = reviewCount !== undefined ? reviewCount : reviews.length;

    return (
        <section className={`product-reviews-section ${className}`.trim()}>
            <div className="detail-container">

                <h3 className="reviews-section-title">
                    Đánh Giá Từ Khách Hàng ({totalReviews})
                </h3>

                <div className="reviews-list-viewport">
                    {reviews.length === 0 ? (
                        <p style={{ color: '#7f8fa6', fontStyle: 'italic' }}>
                            Chưa có đánh giá nào cho món ăn này. Hãy là người đầu tiên để lại cảm nhận nhé!
                        </p>
                    ) : (
                        reviews.map((rev) => (
                            <div key={rev.id} className="review-item-row">

                                <div className="review-main-text-body">
                                    <div className="rev-user-meta">
                                        <h4>{rev.user}</h4>
                                        <span className="rev-date">{rev.date}</span>
                                    </div>

                                    <div className="rev-stars">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={i < rev.rating ? '#f39c12' : 'none'}
                                                stroke="#f39c12"
                                            />
                                        ))}
                                    </div>

                                    <p className="rev-comment-text">{rev.comment}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </section>
    );
};

export default ReviewSection;