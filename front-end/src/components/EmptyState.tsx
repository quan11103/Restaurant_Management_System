import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    message: string;
    actionText?: string;
    actionHref?: string;
    onAction?: () => void;
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    message,
    actionText,
    actionHref,
    onAction,
    className = ''
}) => {
    return (
        <div className={`empty-state-wrapper ${className}`.trim()}>
            <div className="empty-state-icon-circle">
                {icon}
            </div>

            <h2 className="empty-state-title">{title}</h2>
            <p className="empty-state-message">{message}</p>

            {/* Nếu có truyền actionText thì mới hiển thị nút */}
            {actionText && (
                actionHref ? (
                    // Render thẻ <a> nếu là chuyển trang
                    <a href={actionHref} className="primary-action-btn empty-state-btn">
                        {actionText}
                    </a>
                ) : (
                    // Render thẻ <button> nếu là một hành động click
                    <button onClick={onAction} className="primary-action-btn empty-state-btn" type="button">
                        {actionText}
                    </button>
                )
            )}
        </div>
    );
};

export default EmptyState;