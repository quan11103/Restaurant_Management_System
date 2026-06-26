import React, { type ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = '500px'
}) => {
    const [isRendered, setIsRendered] = useState(isOpen);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Khi mở: Render ngay lập tức và khóa cuộn nền
            setIsRendered(true);
            setIsClosing(false);
            document.body.style.overflow = 'hidden';
        } else {
            // Khi đóng: Bật cờ isClosing để chạy CSS animation
            setIsClosing(true);
            document.body.style.overflow = 'unset';

            // Hẹn giờ rồi mới thực sự xóa component
            const timer = setTimeout(() => {
                setIsRendered(false);
                setIsClosing(false);
            }, 300);

            return () => clearTimeout(timer); // Dọn dẹp timer nếu component unmount đột ngột
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isRendered]);

    if (!isRendered) return null;

    return (
        // Thêm class 'closing' vào overlay nếu đang trong trạng thái đóng
        <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={onClose}>

            {/* Khung nội dung chính, stopPropagation để tránh việc bấm vào khung trắng cũng bị đóng */}
            <div
                // Thêm class 'closing' vào container nếu đang trong trạng thái đóng
                className={`modal-container ${isClosing ? 'closing' : ''}`}
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth }}
            >

                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Modal;