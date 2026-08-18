import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className = ''
}) => {
    // Không hiển thị phân trang nếu chỉ có 1 trang hoặc không có trang nào
    if (totalPages <= 1) return null;

    // Thuật toán tính toán danh sách các trang cần hiển thị
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            // Nếu ít hơn 7 trang thì hiển thị tất cả
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Nếu nhiều trang thì cần có dấu '...'
            if (currentPage <= 4) {
                // Đang ở những trang đầu: 1 2 3 4 5 ... Cuối
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                // Đang ở những trang cuối: 1 ... (Cuối-4) (Cuối-3) (Cuối-2) (Cuối-1) Cuối
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // Đang ở khoảng giữa: 1 ... (Hiện tại-1) Hiện tại (Hiện tại+1) ... Cuối
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages;
    };

    const handlePrevious = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className={`pagination-container ${className}`.trim()}>
            {/* Nút Quay lại */}
            <button
                type="button"
                className="pagination-btn pagination-nav"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                aria-label="Trang trước"
            >
                <ChevronLeft size={18} />
            </button>

            {/* Các nút số trang */}
            <div className="pagination-numbers">
                {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="pagination-ellipsis">...</span>
                        ) : (
                            <button
                                type="button"
                                className={`pagination-btn pagination-number ${currentPage === page ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPageChange(page as number);
                                }}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Nút Đi tiếp */}
            <button
                type="button"
                className="pagination-btn pagination-nav"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                aria-label="Trang sau"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default Pagination;