import React, { type ReactNode } from 'react';
import './InfoCard.css';

interface InfoCardProps {
    title: string;
    children: ReactNode;
    actionLabel?: string; // Tùy chọn: Chữ cho nút hành động ở góc phải (VD: "Sửa", "Chi tiết")
    onActionClick?: () => void; // Tùy chọn: Hàm xử lý khi bấm vào nút hành động
    className?: string;
}

export default function InfoCard({
    title,
    children,
    actionLabel,
    onActionClick,
    className = ''
}: InfoCardProps) {
    return (
        <div className={`info-card-container ${className}`}>
            <div className="info-card-header">
                <h4 className="info-card-title">{title}</h4>

                {actionLabel && onActionClick && (
                    <button
                        type="button"
                        className="info-card-action-btn"
                        onClick={onActionClick}
                    >
                        {actionLabel}
                    </button>
                )}
            </div>

            <div className="info-card-body">
                {children}
            </div>
        </div>
    );
}