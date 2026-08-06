import React, { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import axiosClient from '../../../api/axios';
import Button from '../../../components/Button';
import './ReviewSection.css';

export interface ReviewData {
    id: string | number;
    user: string;
    rating: number;
    date: string;
    comment: string;
}

interface ReviewSectionProps {
    dishId: number;
    clientId?: number;
    className?: string;
    onReviewsChange?: (reviews: ReviewData[]) => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
    dishId,
    clientId,
    className = '',
    onReviewsChange,
}) => {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [totalReviews, setTotalReviews] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // State cho Form gửi đánh giá
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    /**
     * 1. API THỰC: Tải danh sách đánh giá từ Backend
     * Endpoint NestJS: GET /reviews/dish/:dishId
     */
    const fetchReviews = useCallback(async () => {
        if (!dishId) return;
        try {
            setIsLoading(true);
            const response = await axiosClient.get(`/reviews/dish/${dishId}`);
            const rawData = response.data; // Mảng các review từ NestJS

            // Map dữ liệu từ Backend về giao diện Frontend
            const formattedReviews: ReviewData[] = rawData.map((item: any) => ({
                id: item.id,
                user: item.client?.fullName || item.client?.email || 'Khách hàng',
                rating: item.rating,
                date: item.updatedAt
                    ? new Date(item.updatedAt).toLocaleDateString('vi-VN')
                    : 'Mới đây',
                comment: item.comment || '',
            }));

            setReviews(formattedReviews);
            setTotalReviews(formattedReviews.length);
            if (onReviewsChange) {
                onReviewsChange(formattedReviews);
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách đánh giá:', err);
        } finally {
            setIsLoading(false);
        }
    }, [dishId]);

    // Tự động gọi API lấy dữ liệu mỗi khi dishId thay đổi
    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    /**
     * 2. API THỰC: Gửi / Cập nhật đánh giá
     * Endpoint NestJS: POST /reviews
     */
    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Vui lòng chọn mức độ hài lòng (số sao) của bạn.');
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('Bạn cần đăng nhập để thực hiện đánh giá món ăn!');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const payload: any = {
                dishId,
                rating,
                comment: comment.trim(),
            };
            if (clientId) {
                payload.clientId = clientId;
            }

            // Gọi API POST tới NestJS
            await axiosClient.post('/reviews', payload);

            // Re-fetch: Tải lại toàn bộ danh sách thực từ DB để giao diện luôn đúng 100%
            await fetchReviews();

            // Reset form
            setRating(0);
            setHoverRating(0);
            setComment('');
        } catch (err: any) {
            console.error('Lỗi khi gửi đánh giá:', err);

            if (err.response?.status === 401) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
            } else {
                const serverMsg = err.response?.data?.message;
                setError(
                    Array.isArray(serverMsg)
                        ? serverMsg[0]
                        : serverMsg || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!'
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className={`product-reviews-section ${className}`.trim()}>
            <div className="detail-container">
                <h3 className="reviews-section-title">
                    Đánh Giá Từ Khách Hàng ({totalReviews})
                </h3>

                {/* Danh sách đánh giá */}
                <div className="reviews-list-viewport">
                    {isLoading ? (
                        <p style={{ color: '#7f8fa6' }}>Đang tải đánh giá...</p>
                    ) : reviews.length === 0 ? (
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

                                    {rev.comment && (
                                        <p className="rev-comment-text">{rev.comment}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Form viết đánh giá */}
                <div className="review-form-container">
                    <h4 className="review-form-title">Viết đánh giá của bạn</h4>
                    <form onSubmit={handleSubmitReview} className="review-form">
                        <div className="form-group">
                            <label className="form-label">
                                Chất lượng món ăn <span className="required-mark">*</span>
                            </label>
                            <div className="interactive-stars">
                                {[1, 2, 3, 4, 5].map((starValue) => (
                                    <Star
                                        key={starValue}
                                        size={28}
                                        className="star-icon cursor-pointer"
                                        fill={(hoverRating || rating) >= starValue ? '#f39c12' : 'none'}
                                        stroke={(hoverRating || rating) >= starValue ? '#f39c12' : '#cbd5e1'}
                                        onMouseEnter={() => setHoverRating(starValue)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => {
                                            setRating(starValue);
                                            setError('');
                                        }}
                                    />
                                ))}
                            </div>
                            {error && (
                                <p className="error-text" style={{ color: '#e74c3c', marginTop: '6px' }}>
                                    {error}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nội dung đánh giá (Không bắt buộc)</label>
                            <textarea
                                className="review-textarea"
                                placeholder="Chia sẻ cảm nhận của bạn về món ăn này nhé..."
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-actions">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ReviewSection;