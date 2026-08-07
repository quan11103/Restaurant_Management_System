import React, { useState, useEffect, useRef } from 'react';
import './FilterSidebar.css';
import RatingStars from './product/RatingStars';
import DecimalNumberInput from './DecimalNumberInput';

export interface FilterSidebarProps {
    onApplyFilter: (filters: { minPrice: string; maxPrice: string; minRating: string; type: string }) => void;
    onClearFilter: () => void;
    hideCategory?: boolean;
    className?: string;
}

const CATEGORIES = [
    { label: 'Món chính', value: 'Món chính' },
    { label: 'Pizza', value: 'Pizza' },
    { label: 'Burger', value: 'Burger' },
    { label: 'Gà rán', value: 'Gà rán' },
    { label: 'Ăn kèm', value: 'Ăn kèm' },
    { label: 'Salad', value: 'Salad' },
    { label: 'Khai vị', value: 'Khai vị' },
    { label: 'Cà phê', value: 'Cà phê' },
    { label: 'Nước ép', value: 'Nước ép' },
    { label: 'Sinh tố', value: 'Sinh tố' },
    { label: 'Đồ uống', value: 'Đồ uống' },
    { label: 'Tráng miệng', value: 'Tráng miệng' },
];

const FilterSidebar: React.FC<FilterSidebarProps> = ({
    onApplyFilter,
    onClearFilter,
    hideCategory = false,
    className = ''
}) => {
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [minRating, setMinRating] = useState<string>('');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    // Dùng useRef giữ tham chiếu ổn định cho onApplyFilter tránh vòng lặp re-render
    const onApplyFilterRef = useRef(onApplyFilter);
    useEffect(() => {
        onApplyFilterRef.current = onApplyFilter;
    }, [onApplyFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onApplyFilterRef.current({
                minPrice,
                maxPrice,
                minRating,
                type: selectedTypes.join(','), // Ghép mảng thành chuỗi phân cách bởi dấu phẩy
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [minPrice, maxPrice, minRating, selectedTypes]);

    const handleClear = () => {
        setMinPrice('');
        setMaxPrice('');
        setMinRating('');
        setSelectedTypes([]);
        onClearFilter();
    };

    // Xử lý khi chọn/bỏ chọn danh mục (Toggle nhiều mục)
    const handleCategoryChange = (catValue: string) => {
        setSelectedTypes((prev) =>
            prev.includes(catValue)
                ? prev.filter((item) => item !== catValue)
                : [...prev, catValue]
        );
    };

    // Xử lý khi click vào ô chọn Rating (Toggle)
    const handleRatingClick = (starValue: number) => {
        const starStr = String(starValue);
        setMinRating((prev) => (prev === starStr ? '' : starStr));
    };

    return (
        <aside className={`filter-sidebar ${className}`.trim()}>
            <div className="filter-header">
                <h3 className="filter-title">Bộ lọc</h3>
                <button type="button" onClick={handleClear} className="btn-clear-filter">
                    Xóa lọc
                </button>
            </div>

            {/* Lọc theo danh mục */}
            {!hideCategory && (
                <div className="filter-group">
                    <h4 className="filter-group-title">Danh mục</h4>
                    <div className="filter-options-list">
                        {CATEGORIES.map((cat) => (
                            <label key={cat.value} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    checked={selectedTypes.includes(cat.value)}
                                    onChange={() => handleCategoryChange(cat.value)}
                                />
                                <span>{cat.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Lọc theo giá */}
            <div className="filter-group">
                <h4 className="filter-group-title">Khoảng giá (VNĐ)</h4>
                <div className="price-inputs-wrapper">
                    <DecimalNumberInput
                        value={minPrice}
                        onChange={(val) => setMinPrice(val)}
                        placeholder="Từ"
                        className="price-input"
                        min={0}
                    />
                    <span className="price-separator">-</span>
                    <DecimalNumberInput
                        value={maxPrice}
                        onChange={(val) => setMaxPrice(val)}
                        placeholder="đến"
                        className="price-input"
                        min={0}
                    />
                </div>
            </div>

            {/* Lọc theo đánh giá */}
            <div className="filter-group">
                <h4 className="filter-group-title">Đánh giá tối thiểu</h4>
                <div className="filter-options-list">
                    {[4, 3].map((star) => (
                        <label key={star} className="radio-label">
                            <input
                                type="radio"
                                name="rating"
                                className="custom-radio"
                                checked={minRating === String(star)}
                                onChange={() => { }}
                                onClick={() => handleRatingClick(star)}
                            />
                            <div className="rating-stars-item">
                                <RatingStars rating={star} size={16} isInteractive={false} />
                                <span className="rating-suffix">trở lên</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default FilterSidebar;