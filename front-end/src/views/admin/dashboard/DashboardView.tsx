import React, { useState, useEffect } from 'react';
import DataTable, { type Column } from '../../../components/DataTable';
import { TrendingUp, Users, ShoppingBag } from 'lucide-react';
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

const MOCK_DATA: ProductStat[] = [
    { id: 'p1', name: 'Gà rán giòn cay', imageUrl: 'https://via.placeholder.com/40', soldCount: 150, revenue: 6750000 },
    { id: 'p2', name: 'Burger bò phô mai', imageUrl: 'https://via.placeholder.com/40', soldCount: 85, revenue: 4675000 },
    { id: 'p3', name: 'Pizza hải sản', imageUrl: 'https://via.placeholder.com/40', soldCount: 200, revenue: 25800000 },
    { id: 'p4', name: 'Trà sữa trân châu', imageUrl: 'https://via.placeholder.com/40', soldCount: 320, revenue: 11200000 },
    { id: 'p5', name: 'Mì cay 7 cấp độ', imageUrl: 'https://via.placeholder.com/40', soldCount: 110, revenue: 5390000 },
];

const DashboardView: React.FC = () => {
    const [products, setProducts] = useState<RankedProductStat[]>([]);

    useEffect(() => {
        // Sắp xếp dữ liệu và gán thêm trường rank (thứ hạng) dựa vào index
        const sortedData = [...MOCK_DATA]
            .sort((a, b) => b.revenue - a.revenue)
            .map((item, index) => ({
                ...item,
                rank: index + 1
            }));

        setProducts(sortedData);
    }, []);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' đ';
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
                        <h3 className="stat-value">24.500.000 đ</h3>
                    </div>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-wrapper orders">
                        <ShoppingBag size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Đơn hàng mới</span>
                        <h3 className="stat-value">128</h3>
                    </div>
                </div>

                <div className="stat-box">
                    <div className="stat-icon-wrapper customers">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Khách hàng</span>
                        <h3 className="stat-value">85</h3>
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