import React from 'react';
import './CategoryGrid.css';

export interface Category {
    id: string | number;
    name: string;
    imageUrl: string;
}

interface CategoryGridProps {
    categories: Category[];
    isLoading?: boolean;
    onCategoryClick?: (categoryName: string) => void;
    title?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
    categories,
    isLoading = false,
    onCategoryClick,
    title = "Khám phá danh mục"
}) => {

    const skeletonArray = Array.from({ length: 8 });

    return (
        <section className="category-section">
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
            </div>
            <div className="category-grid">
                {isLoading ? (
                    skeletonArray.map((_, index) => (
                        <div className="category-item skeleton-item" key={`skeleton-${index}`}>
                            <div className="category-image-wrapper skeleton-img"></div>
                            <div className="skeleton-text"></div>
                        </div>
                    ))
                ) : (
                    /* Trạng thái hiển thị dữ liệu thật */
                    categories.map((category) => (
                        <a
                            className="category-item"
                            key={category.id}
                            onClick={(e) => {
                                e.preventDefault();
                                if (onCategoryClick) {
                                    onCategoryClick(category.name);
                                }
                            }}
                        >
                            <div className="category-image-wrapper">
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="category-image"
                                    loading="lazy"
                                />
                            </div>
                            <span className="category-name">{category.name}</span>
                        </a>
                    ))
                )}
            </div>
        </section>
    );
};

export default CategoryGrid;