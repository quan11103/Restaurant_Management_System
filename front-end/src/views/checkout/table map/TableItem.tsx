import React from 'react';
import { Users, ReceiptText, Clock, Utensils } from 'lucide-react';
import './TableItem.css';

export interface TableModel {
    id: number;
    restaurantId: number;
    name: string;
    capacity: number;
    description: string | null;
    isOccupied: boolean;

    orderTables?: {
        id: number;
        orderId: number;
        isPaid: boolean;
        order: {
            total: number;
            status: 'PENDING' | 'PROCESSING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
        }
    }[];
}

interface TableItemProps {
    table: TableModel;
    onClick: (table: TableModel) => void;
}

const TableItem: React.FC<TableItemProps> = ({ table, onClick }) => {

    // Tìm Order ở bàn
    const activeOrderInfo = table.orderTables?.find(ot => ot.isPaid === false);

    // Định nghĩa các trạng thái
    const isAvailable = !table.isOccupied;
    const isOccupied = table.isOccupied && !!activeOrderInfo;

    // Bàn đang ăn nhưng món đã ra đủ (COMPLETED) => Sẵn sàng chờ thanh toán
    const isWaitingPayment = isOccupied && activeOrderInfo?.order.status === 'COMPLETED';

    const getStatusClass = () => {
        if (isAvailable) return 'status-available';
        if (isWaitingPayment) return 'status-waiting';
        return 'status-occupied';
    };

    const renderIcon = () => {
        if (isAvailable) return <Users size={24} opacity={0.3} />;
        if (isWaitingPayment) return <ReceiptText size={24} />;

        // Nếu đang ở trạng thái bếp đang làm hoặc chuẩn bị món
        if (activeOrderInfo?.order.status === 'PROCESSING') return <Utensils size={24} />;
        return <Clock size={24} />;
    };

    const renderSubInfo = () => {
        if (isAvailable) return `${table.capacity} chỗ`;

        if (activeOrderInfo) {
            if (isWaitingPayment) {
                return `${activeOrderInfo.order.total.toLocaleString('vi-VN')} đ`;
            }
            // Hiển thị trạng thái đơn hàng hiện tại
            const statusText = activeOrderInfo.order.status === 'PENDING' ? 'Mới gọi món' :
                activeOrderInfo.order.status === 'PROCESSING' ? 'Đang phục vụ' :
                    activeOrderInfo.order.status === 'DELIVERING' ? 'Đang giao...' : 'Đang phục vụ';
            return statusText;
        }

        return 'Đang dọn...';
    };

    return (
        <div
            className={`table-item ${getStatusClass()}`}
            onClick={() => onClick(table)}
        >
            <div className="table-header">
                <span className="table-name">{table.name}</span>
                <span className="table-icon">{renderIcon()}</span>
            </div>
            <div className="table-body">
                <span className="table-sub-info">{renderSubInfo()}</span>
            </div>
        </div>
    );
};

export default TableItem;