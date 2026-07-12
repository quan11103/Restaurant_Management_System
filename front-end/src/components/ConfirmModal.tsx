import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import './ConfirmModal.css';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string | React.ReactNode;
    type?: 'danger' | 'warning' | 'info';
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    type = 'warning',
    confirmLabel = 'Xác nhận',
    cancelLabel = 'Hủy bỏ',
    onConfirm,
    onCancel
}) => {
    // Quản lý việc thực tế có render HTML ra DOM hay không
    const [shouldRender, setShouldRender] = useState(isOpen);
    // Quản lý việc thêm class hiệu ứng đóng
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsClosing(false);
        } else if (shouldRender) {
            // Khi isOpen chuyển từ true -> false, kích hoạt trạng thái đóng trước
            setIsClosing(true);

            // Chờ hiệu ứng CSS chạy xong (200ms) mới chính thức gỡ khỏi DOM
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [isOpen, shouldRender]);

    // Nếu không cần render thì trả về null
    if (!shouldRender) return null;

    const renderIcon = () => {
        switch (type) {
            case 'danger':
                return <AlertTriangle size={32} className="cm-icon text-danger" />;
            case 'info':
                return <Info size={32} className="cm-icon text-info" />;
            default:
                return <HelpCircle size={32} className="cm-icon text-warning" />;
        }
    };

    return (
        /* Thêm class cm-closing khi đang trong trạng thái đóng */
        <div className={`cm-overlay ${isClosing ? 'cm-closing' : ''}`} onClick={onCancel}>
            {/* Dừng nổi bọt sự kiện để click vào trong modal không bị đóng */}
            <div className={`cm-box cm-type-${type} ${isClosing ? 'cm-closing' : ''}`} onClick={(e) => e.stopPropagation()}>

                <div className="cm-header">
                    <h4>{title}</h4>
                </div>

                <div className="cm-body">
                    {renderIcon()}
                    <div className="cm-message">
                        {typeof message === 'string' ? <p>{message}</p> : message}
                    </div>
                </div>

                <div className="cm-footer">
                    <button className="cm-btn cm-btn-cancel" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button className={`cm-btn cm-btn-confirm btn-${type}`} onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ConfirmModal;