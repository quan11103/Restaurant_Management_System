import React from 'react';
import { Users } from 'lucide-react';
import './TableItem.css';

export type OrderStatusType = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

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
            status: OrderStatusType;
        };
    }[];
}

interface TableItemProps {
    table: TableModel;
    onClick: (table: TableModel) => void;
}

const TableItem: React.FC<TableItemProps> = ({ table, onClick }) => {
    // Lấy order chưa thanh toán của bàn (nếu có)
    const activeOrderInfo = table.orderTables?.find(ot => ot.isPaid === false);

    const isOccupied = table.isOccupied;

    // Render thông tin phụ bên dưới tên bàn
    const renderSubInfo = () => {
        if (!isOccupied) return `${table.capacity} chỗ`;
        return 'Đang phục vụ';
    };

    return (
        <div
            className={`table-item ${isOccupied ? 'status-occupied' : 'status-available'}`}
            onClick={() => onClick(table)}
        >
            <div className="table-header">
                <span className="table-name">{table.name}</span>
                <span className="table-icon">{isOccupied && <Users size={20} />}</span>
            </div>
            <div className="table-body">
                <span className="table-sub-info">{renderSubInfo()}</span>
            </div>
        </div>
    );
};

export default TableItem;