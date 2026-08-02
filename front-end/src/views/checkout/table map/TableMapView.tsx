import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import axiosClient from '../../../api/axios';
import { type TableModel } from './TableItem';
import TableGrid from './TableGrid';
import './TableMapView.css';

type StatusFilter = 'ALL' | 'AVAILABLE' | 'OCCUPIED';

const TableMapView: React.FC = () => {
    // 1. Khai báo các State
    const [tables, setTables] = useState<TableModel[]>([]);
    const [summary, setSummary] = useState({ total: 0, available: 0, occupied: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

    // 2. Khai báo navigate
    const navigate = useNavigate();

    // 3. Tích hợp API Fetch Data
    useEffect(() => {
        const fetchTableData = async () => {
            setIsLoading(true);
            try {
                // Sắp xếp bàn tăng dần (sortBy=name_asc)
                const response = await axiosClient.get('/tables?limit=100&sortBy=name_asc');

                const tableData = response.data.data;
                setTables(tableData);

                setSummary({
                    total: tableData.length,
                    available: tableData.filter((t: TableModel) => !t.isOccupied).length,
                    occupied: tableData.filter((t: TableModel) => t.isOccupied).length,
                });

            } catch (error) {
                console.error("Lỗi khi fetch data bàn:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTableData();
    }, []);

    // 4. Xử lý click bàn & truyền state sang trang /staff-order
    const handleTableClick = (table: TableModel) => {
        if (!table.isOccupied) {
            // Bàn trống -> Chuyển sang order mới cho bàn này
            console.log(`Mở menu gọi món cho ${table.name}`);
            navigate('/staff-order', {
                state: {
                    tableId: table.id,
                    tableName: table.name,
                }
            });
        } else {
            // Bàn đang phục vụ -> Chuyển sang order hiện tại
            const activeOrder = table.orderTables?.find(ot => ot.isPaid === false);
            console.log(`Mở chi tiết Order #${activeOrder?.orderId} của ${table.name}`);

            navigate('/staff-order', {
                state: {
                    tableId: table.id,
                    tableName: table.name,
                    orderId: activeOrder?.orderId || null,
                }
            });
        }
    };

    const filteredTables = tables.filter(table => {
        const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === 'AVAILABLE') return matchesSearch && !table.isOccupied;
        if (statusFilter === 'OCCUPIED') return matchesSearch && table.isOccupied;

        return matchesSearch;
    });

    return (
        <div className="table-map-layout">
            <div className="table-map-header">
                <h2>Danh sách bàn</h2>

                <div className="table-map-controls">
                    <input
                        type="text"
                        placeholder="Tìm bàn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="table-search-input"
                    />

                    <div className="status-filter-tabs">
                        <button
                            className={statusFilter === 'ALL' ? 'active' : ''}
                            onClick={() => setStatusFilter('ALL')}
                        >
                            Tất cả ({summary.total})
                        </button>
                        <button
                            className={statusFilter === 'AVAILABLE' ? 'active' : ''}
                            onClick={() => setStatusFilter('AVAILABLE')}
                        >
                            Trống ({summary.available})
                        </button>
                        <button
                            className={statusFilter === 'OCCUPIED' ? 'active' : ''}
                            onClick={() => setStatusFilter('OCCUPIED')}
                        >
                            Đang phục vụ ({summary.occupied})
                        </button>
                    </div>
                </div>
            </div>

            <div className="status-legend">
                <div className="legend-item"><span className="dot dot-available"></span> Bàn trống</div>
                <div className="legend-item"><span className="dot dot-occupied"></span> Đang phục vụ</div>
            </div>

            <div className="table-map-content">
                {isLoading ? (
                    <div className="table-loading-spinner">Đang tải danh sách bàn...</div>
                ) : (
                    <TableGrid tables={filteredTables} onTableClick={handleTableClick} />
                )}
            </div>
        </div>
    );
};

export default TableMapView;