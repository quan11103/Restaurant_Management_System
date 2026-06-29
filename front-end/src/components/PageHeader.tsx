import React from 'react';
import { ArrowLeft } from 'lucide-react';
import './PageHeader.css';

export interface BreadcrumbItem {
    label: string;
    path?: string; // Có thể mở rộng để dùng với react-router-dom nếu cần
}

interface PageHeaderProps {
    title: string;
    showBackButton?: boolean;
    onBack?: () => void;
    breadcrumbs?: BreadcrumbItem[];
    extraActions?: React.ReactNode; // Các nút bấm/hành động bên phải (tùy chọn)
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    showBackButton = false,
    onBack,
    breadcrumbs,
    extraActions
}) => {
    return (
        <div className="page-header-container">
            {/* Khối bên trái: Gồm Breadcrumbs và Tiêu đề */}
            <div className="ph-left-section">
                {/* Hiển thị Breadcrumbs nếu có truyền vào */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="ph-breadcrumbs">
                        {breadcrumbs.map((crumb, index) => (
                            <span key={index} className="ph-breadcrumb-item">
                                {crumb.label}
                                {index < breadcrumbs.length - 1 && <span className="ph-separator">/</span>}
                            </span>
                        ))}
                    </div>
                )}

                <div className="ph-title-wrapper">
                    {showBackButton && (
                        <button className="ph-btn-back" onClick={onBack} title="Quay lại">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h2 className="ph-title">{title}</h2>
                </div>
            </div>

            {/* Khối bên phải: Chứa các component hành động động */}
            {extraActions && (
                <div className="ph-right-section">
                    {extraActions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;