import React, { useState } from 'react';
import { type TableModel } from './TableItem';
import TableGrid from './TableGrid';
import './TableMapView.css';

const MOCK_PRISMA_TABLES: TableModel[] = [
    {
        id: 1, restaurantId: 1, name: 'Bàn 01', capacity: 2, description: null,
        isOccupied: false, orderTables: []
    },
    {
        id: 2, restaurantId: 1, name: 'Bàn 02', capacity: 4, description: null,
        isOccupied: true,
        orderTables: [{
            id: 101, orderId: 5001, isPaid: false,
            order: { total: 150000, status: 'PROCESSING' }
        }]
    },
    {
        id: 3, restaurantId: 1, name: 'Bàn 03', capacity: 4, description: null,
        isOccupied: true,
        orderTables: [{
            id: 102, orderId: 5002, isPaid: false,
            order: { total: 325000, status: 'COMPLETED' }
        }]
    },
    {
        id: 4, restaurantId: 1, name: 'Bàn 04', capacity: 0, description: 'Bàn ảo cho app',
        isOccupied: true,
        orderTables: [{
            id: 103, orderId: 5003, isPaid: false,
            order: { total: 85000, status: 'PROCESSING' }
        }]
    },
    {
        id: 5, restaurantId: 1, name: 'Bàn 05', capacity: 6, description: null,
        isOccupied: false, orderTables: []
    }
];

const TableMapView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleTableClick = (table: TableModel) => {
        if (!table.isOccupied) {
            console.log(`Mở menu gọi món cho ${table.name}`);
        } else {
            const activeOrder = table.orderTables?.find(ot => ot.isPaid === false);

            if (activeOrder?.order.status === 'COMPLETED') {
                console.log(`Chuyển sang màn hình Thanh toán cho ${table.name}, OrderID: ${activeOrder.orderId}`);
            } else {
                console.log(`Mở popup xem chi tiết món đang lên của ${table.name}`);
            }
        }
    };

    // Lọc danh sách bàn dựa trên từ khóa tìm kiếm
    const filteredTables = MOCK_PRISMA_TABLES.filter(table =>
        table.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="table-map-layout">
            <div className="table-map-header">
                <h2>Sơ đồ phòng bàn</h2>

                {/* Thanh tìm kiếm bàn */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Tìm bàn"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="table-search-input"
                    />
                </div>
            </div>

            <div className="status-legend">
                <div className="legend-item"><span className="dot dot-available"></span> Bàn trống</div>
                <div className="legend-item"><span className="dot dot-occupied"></span> Đang phục vụ</div>
                <div className="legend-item"><span className="dot dot-waiting"></span> Chờ thanh toán</div>
            </div>

            <TableGrid tables={filteredTables} onTableClick={handleTableClick} />
        </div>
    );
};

export default TableMapView;