import React, { useState, useEffect } from 'react';
import DataTable, { type Column } from '../../../components/DataTable';
import { TrendingUp, Users, ShoppingBag } from 'lucide-react';
import axiosClient from '../../../api/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

type TimeFilter = 'day' | 'week' | 'month' | 'year';

// Bộ dữ liệu giả cho các mốc thời gian khác nhau
const mockRevenueData = {
    day: [
        { date: 'Thứ 2', revenue: 1500000 },
        { date: 'Thứ 3', revenue: 2100000 },
        { date: 'Thứ 4', revenue: 1800000 },
        { date: 'Thứ 5', revenue: 2400000 },
        { date: 'Thứ 6', revenue: 3200000 },
        { date: 'Thứ 7', revenue: 4500000 },
        { date: 'Chủ Nhật', revenue: 3900000 },
    ],
    week: [
        { date: 'Tuần 1', revenue: 12500000 },
        { date: 'Tuần 2', revenue: 14200000 },
        { date: 'Tuần 3', revenue: 11800000 },
        { date: 'Tuần 4', revenue: 16500000 },
    ],
    month: [
        { date: 'Thg 1', revenue: 45000000 },
        { date: 'Thg 2', revenue: 52000000 },
        { date: 'Thg 3', revenue: 48000000 },
        { date: 'Thg 4', revenue: 61000000 },
        { date: 'Thg 5', revenue: 59000000 },
        { date: 'Thg 6', revenue: 75000000 },
    ],
    year: [
        { date: '2024', revenue: 650000000 },
        { date: '2025', revenue: 820000000 },
        { date: '2026', revenue: 450000000 }, // Dữ liệu đến thời điểm hiện tại
    ]
};

const DashboardView: React.FC = () => {
    const [products, setProducts] = useState<RankedProductStat[]>([]);
    const [stats, setStats] = useState<QuickStats>({
        todayRevenue: 0,
        todayOrders: 0,
        totalCustomers: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('day');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await axiosClient.get('/statistics/dashboard-overview');
                const data = response.data?.data || response.data;

                setStats({
                    todayRevenue: data.stats?.todayRevenue || 0,
                    todayOrders: data.stats?.todayOrders || 0,
                    totalCustomers: data.stats?.totalCustomers || 0,
                });

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

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setIsChartLoading(true);
                const response = await axiosClient.get(`/statistics/revenue-chart?period=${timeFilter}`);
                // axiosClient trả về response.data. Thường NestJS sẽ nằm trong cấu trúc này
                const data = response.data?.data || response.data;
                setChartData(data);
            } catch (error) {
                console.error("Lỗi tải biểu đồ:", error);
            } finally {
                setIsChartLoading(false);
            }
        };

        fetchChartData();
    }, [timeFilter]);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' đ';
    };

    // Hàm format số gọn lại cho trục Y (Ví dụ: 1.5M, 20M)
    const formatYAxis = (value: number) => {
        if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toString();
    };

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
                    {record.imageUrl && (
                        <img
                            src={record.imageUrl}
                            alt={record.name}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }}
                        />
                    )}
                    <span className="dashboard-product-name">{record.name}</span>
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

    if (isLoading) {
        return <div className="dashboard-container" style={{ padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</div>;
    }
    if (error) {
        return <div className="dashboard-container" style={{ padding: '20px', color: 'red' }}>Lỗi: {error}</div>;
    }

    return (
        <div className="dashboard-container">

            {/* Khu vực thẻ thống kê nhanh */}
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

            {/* Khu vực Biểu đồ doanh thu */}
            <div className="dashboard-chart-section">
                <div className="dashboard-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Biểu đồ doanh thu</h3>
                    <div className="chart-filter-group">
                        <button
                            className={`filter-btn ${timeFilter === 'day' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('day')}
                        >
                            7 Ngày
                        </button>
                        <button
                            className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('week')}
                        >
                            4 Tuần
                        </button>
                        <button
                            className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('month')}
                        >
                            6 Tháng
                        </button>
                        <button
                            className={`filter-btn ${timeFilter === 'year' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('year')}
                        >
                            Theo Năm
                        </button>
                    </div>
                </div>

                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={350}>
                        {isChartLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                Đang tải biểu đồ...
                            </div>
                        ) : (
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#8c8c8c', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#8c8c8c', fontSize: 12 }}
                                    tickFormatter={formatYAxis}
                                    width={60}
                                />
                                <Tooltip
                                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                                    labelStyle={{ color: '#262626', fontWeight: 600, marginBottom: '4px' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#1890ff"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                    activeDot={{ r: 6, stroke: '#1890ff', strokeWidth: 2 }}
                                    animationDuration={500}
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Khu vực Bảng xếp hạng món ăn theo doanh thu */}
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