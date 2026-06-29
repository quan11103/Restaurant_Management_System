import React from 'react';
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

    if (!isOpen) return null;

    // Hàm render icon phù hợp với loại modal
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
        <div className="cm-overlay" onClick={onCancel}>
            {/* Dừng nổi bọt sự kiện để click vào trong modal không bị đóng */}
            <div className={`cm-box cm-type-${type}`} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="cm-header">
                    <h4>{title}</h4>
                    <button className="cm-btn-close" onClick={onCancel}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="cm-body">
                    {renderIcon()}
                    <div className="cm-message">
                        {typeof message === 'string' ? <p>{message}</p> : message}
                    </div>
                </div>

                {/* Footer Actions */}
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