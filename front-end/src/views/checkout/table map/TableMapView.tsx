import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axios';
import { type TableModel } from './TableItem';
import TableGrid from './TableGrid';
import './TableMapView.css';

type StatusFilter = 'ALL' | 'AVAILABLE' | 'OCCUPIED';

const TableMapView: React.FC = () => {
    const [tables, setTables] = useState<TableModel[]>([]);
    const [summary, setSummary] = useState({ total: 0, available: 0, occupied: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

    const navigate = useNavigate();

    // 1. Tách hàm fetchTableData ra ngoài để tái sử dụng
    // Dùng useCallback để hàm không bị tạo lại sau mỗi lần re-render
    const fetchTableData = useCallback(async (isSilent = false) => {
        // Nếu không phải refetch ngầm (isSilent = false) thì mới hiện loading spinner
        if (!isSilent) setIsLoading(true);

        try {
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
            if (!isSilent) setIsLoading(false);
        }
    }, []);

    // 2. Fetch dữ liệu lần đầu khi component mount
    useEffect(() => {
        fetchTableData();
    }, [fetchTableData]);

    // 3. Lắng nghe SSE và tự động refetch ngầm (isSilent = true) khi có event mới
    useEffect(() => {
        const eventSource = new EventSource('http://localhost:3000/api/stream');

        eventSource.onmessage = () => {
            // const payload = JSON.parse(event.data);

            // Bạn có thể lọc event (ví dụ chỉ refetch khi đúng loại event liên quan đến Table/Order)
            // if (payload.type === 'TABLE_UPDATED' || payload.type === 'ORDER_CREATED') {
            fetchTableData(true); // true = refetch ngầm, không làm nháy màn hình
            // }
        };

        return () => {
            eventSource.close();
        };
    }, [fetchTableData]);

    const handleTableClick = (table: TableModel) => {
        const userRole = localStorage.getItem('user_role');

        if (!table.isOccupied) {
            if (userRole === 'CASHIER') {
                return;
            }

            navigate('/staff-order', {
                state: {
                    tableId: table.id,
                    tableName: table.name,
                }
            });
        } else {
            const activeOrder = table.orderTables?.find(ot => ot.isPaid === false);

            navigate('/staff-checkout', {
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