import React, { useState, useEffect } from 'react';
import DataTable, { type Column } from '../../../components/DataTable';
import { TrendingUp, Users, ShoppingBag } from 'lucide-react';
import axiosClient from '../../../api/axios';
import './DashboardView.css';

interface ProductStat {
    id: string;
    name: string;
    imageUrl: string;
    soldCount: number;
    revenue: number;
}

interface RankedProductStat extends ProductStat {
    rank: number;
}

interface QuickStats {
    todayRevenue: number;
    todayOrders: number;
    totalCustomers: number;
}

const DashboardView: React.FC = () => {
    // State cho bảng món ăn
    const [products, setProducts] = useState<RankedProductStat[]>([]);

    // State cho khu vực thống kê nhanh (3 ô vuông)
    const [stats, setStats] = useState<QuickStats>({
        todayRevenue: 0,
        todayOrders: 0,
        totalCustomers: 0
    });

    // Trạng thái loading và xử lý lỗi
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Gọi API khi component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Gọi API lấy overview dashboard (đường dẫn khớp với backend đã tạo)
                const response = await axiosClient.get('/statistics/dashboard-overview');

                // Giả định response.data trả về format: { stats: {}, topDishes: [] } 
                // theo chuẩn của axios (hoặc tùy thuộc vào interceptor của bạn)
                const data = response.data?.data || response.data;

                // 1. Cập nhật Thống kê nhanh
                setStats({
                    todayRevenue: data.stats?.todayRevenue || 0,
                    todayOrders: data.stats?.todayOrders || 0,
                    totalCustomers: data.stats?.totalCustomers || 0,
                });

                // 2. Cập nhật Top Món ăn (backend đã xử lý sẵn rank và sort)
                setProducts(data.topDishes || []);

            } catch (err: any) {
                console.error("Lỗi tải dữ liệu Dashboard:", err);
                setError(err.response?.data?.message || 'Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Hàm format tiền tệ (VNĐ)
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' đ';
    };

    // Cấu hình cột cho DataTable
    const columns: Column<RankedProductStat>[] = [
        {
            key: 'rank',
            title: 'Top',
            render: (record) => (
                <span className={`rank-badge rank-${record.rank}`}>
                    #{record.rank}
                </span>
            )
        },
        {
            key: 'name',
            title: 'Món ăn',
            render: (record) => (
                <div className="product-cell">
                    {/* Thêm hình ảnh món ăn nếu CSS của bạn có hỗ trợ */}
                    {record.imageUrl && (
                        <img
                            src={record.imageUrl}
                            alt={record.name}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }}
                        />
                    )}
                    <span className="product-name">{record.name}</span>
                </div>
            )
        },
        {
            key: 'soldCount',
            title: 'Đã bán',
            render: (record) => <span className="sold-count">{record.soldCount}</span>
        },
        {
            key: 'revenue',
            title: 'Tổng doanh thu',
            render: (record) => <span className="revenue-amount">{formatCurrency(record.revenue)}</span>
        }
    ];

    // Giao diện khi đang loading
    if (isLoading) {
        return <div className="dashboard-container" style={{ padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</div>;
    }

    // Giao diện khi lỗi
    if (error) {
        return <div className="dashboard-container" style={{ padding: '20px', color: 'red' }}>Lỗi: {error}</div>;
    }

    return (
        <div className="dashboard-container">

            {/* 1. Khu vực thẻ thống kê nhanh (Stat Grid) */}
            <div className="dashboard-stats-grid">
                <div className="stat-box">
                    <div className="stat-icon-wrapper revenue">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Doanh thu hôm nay</span>
                        <h3 className="stat-value">{formatCurrency(stats.todayRevenue)}</h3>
                    </div>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-wrapper orders">
                        <ShoppingBag size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Đơn hàng mới</span>
                        <h3 className="stat-value">{stats.todayOrders}</h3>
                    </div>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-wrapper customers">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Tổng Khách hàng</span>
                        <h3 className="stat-value">{stats.totalCustomers}</h3>
                    </div>
                </div>
            </div>

            {/* 2. Khu vực Bảng xếp hạng món ăn theo doanh thu */}
            <div className="dashboard-table-section">
                <div className="dashboard-section-header">
                    <h3>Top món ăn theo doanh thu</h3>
                </div>

                <div className="section-body">
                    <DataTable
                        columns={columns}
                        data={products}
                        emptyMessage="Chưa có dữ liệu thống kê"
                    />
                </div>
            </div>

        </div>
    );
};

export default DashboardView;