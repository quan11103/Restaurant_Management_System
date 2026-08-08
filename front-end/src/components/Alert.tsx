import React, { createContext, useState, useContext, type ReactNode, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import './Alert.css';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface Alert {
    id: string;
    type: AlertType;
    message: string;
    title?: string;
}

interface AlertContextType {
    showAlert: (type: AlertType, message: string, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// ==========================================
// COMPONENT CON: Quản lý từng thông báo riêng lẻ
// ==========================================
const AlertItemComponent: React.FC<{ alert: Alert; onRemove: (id: string) => void }> = ({ alert, onRemove }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Tự động kích hoạt hiệu ứng đóng sau 3.5 giây
        const timer = setTimeout(() => {
            handleClose();
        }, 3500);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsClosing(true); // 1. Bật class 'closing' để chạy animation trượt ra

        // 2. Chờ 300ms cho animation chạy xong rồi mới xóa hẳn khỏi React
        setTimeout(() => {
            onRemove(alert.id);
        }, 500);
    };

    const renderIcon = (type: AlertType) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 size={22} strokeWidth={2.5} />;
            case 'error':
                return <AlertCircle size={22} strokeWidth={2.5} />;
            case 'warning':
                return <AlertTriangle size={22} strokeWidth={2.5} />;
            case 'info':
                return <Info size={22} strokeWidth={2.5} />;
            default:
                return null;
        }
    };

    return (
        <div className={`alert-item alert-${alert.type} ${isClosing ? 'closing' : ''}`}>
            <div className="alert-icon">{renderIcon(alert.type)}</div>
            <div className="alert-content">
                {alert.title && <div className="alert-title">{alert.title}</div>}
                <p className="alert-message">{alert.message}</p>
            </div>
            <button className="alert-close-btn" onClick={handleClose}>
                &times;
            </button>
        </div>
    );
};

// ==========================================
// PROVIDER: Quản lý danh sách các thông báo
// ==========================================
export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    const showAlert = useCallback((type: AlertType, message: string, title?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setAlerts((prev) => [...prev, { id, type, message, title }]);
    }, []);

    const removeAlert = useCallback((id: string) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <div className="alert-container">
                {alerts.map((alert) => (
                    <AlertItemComponent
                        key={alert.id}
                        alert={alert}
                        onRemove={removeAlert}
                    />
                ))}
            </div>
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert phải được sử dụng bên trong AlertProvider');
    }
    return context;
};