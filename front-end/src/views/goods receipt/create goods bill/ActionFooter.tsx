import React from 'react';
import { XCircle, Save } from 'lucide-react';
import './ActionFooter.css';

interface ActionFooterProps {
    onSubmit: () => void;
    cancelLabel?: string;
    submitLabel?: string;
    isSubmitDisabled?: boolean;
    isLoading?: boolean;
    cancelIcon?: React.ReactNode;
    submitIcon?: React.ReactNode;
}

const ActionFooter: React.FC<ActionFooterProps> = ({
    onSubmit,
    cancelLabel = 'Hủy bỏ',
    submitLabel = 'Xác nhận nhập kho',
    isSubmitDisabled = false,
    isLoading = false,
    cancelIcon = <XCircle size={20} />,
    submitIcon = <Save size={20} />
}) => {
    return (
        <div className="action-footer">
            <button
                type="button"
                className="btn-footer-cancel"
                disabled={isLoading}
            >
                {cancelIcon}
                <span>{cancelLabel}</span>
            </button>

            <button
                type="button"
                className="btn-footer-submit"
                onClick={onSubmit}
                disabled={isSubmitDisabled || isLoading}
            >
                {isLoading ? (
                    <div className="footer-spinner"></div>
                ) : (
                    submitIcon
                )}
                <span>{isLoading ? 'Đang xử lý...' : submitLabel}</span>
            </button>
        </div>
    );
};

export default ActionFooter;