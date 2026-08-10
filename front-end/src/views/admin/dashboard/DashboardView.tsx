import React, { useState, useEffect } from 'react';
import DataTable, { type Column } from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import { TrendingUp, Users, ShoppingBag } from 'lucide-react';
import axiosClient from '../../../api/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardView.css';
import BillSummary, { type BillModel } from '../../checkout/checkout/BillSummary';

// --- Type definitions cho Đơn hàng & Món ăn ---
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'COMPLETED';

export interface OrderItem {
    id: number;
    receiverName: string;
    receiverPhone: string;
    orderTime: string;
    total: number;
    status: OrderStatus;
    shippingAddress?: string;
}

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

// --- Danh sách nhãn trạng thái ---
const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
    PENDING: 'Chờ xác nhận',
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Đã giao',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
};

const DashboardView: React.FC = () => {
    const [products, setProducts] = useState<RankedProductStat[]>([]);
    const [stats, setStats] = useState<QuickStats>({
        todayRevenue: 0,
        todayOrders: 0,
        totalCustomers: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('day');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- State quản lý Modal & Danh sách Đơn hàng theo món ---
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<RankedProductStat | null>(null);
    const [productOrders, setProductOrders] = useState<OrderItem[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<BillModel | null>(null);
    const [isBillOpen, setIsBillOpen] = useState<boolean>(false);
    const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // 1. Tải dữ liệu Tổng quan (Stats + Top món)
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

    // 2. Tải dữ liệu Biểu đồ Doanh thu theo bộ lọc thời gian
    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setIsChartLoading(true);
                const response = await axiosClient.get(`/statistics/revenue-chart?period=${timeFilter}`);
                const data = response.data?.data || response.data;
                setChartData(data || []);
            } catch (error) {
                console.error("Lỗi tải biểu đồ:", error);
            } finally {
                setIsChartLoading(false);
            }
        };

        fetchChartData();
    }, [timeFilter]);

    // 3. Tải danh sách đơn hàng của Món ăn được chọn khi Modal mở
    useEffect(() => {
        const fetchProductOrders = async () => {
            if (!selectedProduct || !isModalOpen) return;

            try {
                setIsModalLoading(true);
                setModalError(null);

                // Đường dẫn API gọi tới Backend NestJS (truyền ID món ăn)
                const response = await axiosClient.get(`/statistics/product/${selectedProduct.id}/orders`);
                const resData = response.data?.data || response.data;

                // Kiểm tra cấu trúc dữ liệu trả về (mảng trực tiếp hoặc nằm trong object data/items)
                if (Array.isArray(resData)) {
                    setProductOrders(resData);
                } else if (resData && Array.isArray(resData.data)) {
                    setProductOrders(resData.data);
                } else {
                    setProductOrders([]);
                }
            } catch (err: any) {
                console.error("Lỗi tải danh sách đơn hàng:", err);
                setModalError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng.');
                setProductOrders([]);
            } finally {
                setIsModalLoading(false);
            }
        };

        fetchProductOrders();
    }, [selectedProduct, isModalOpen]);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' đ';
    };

    const formatYAxis = (value: number) => {
        if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toString();
    };

    // Định nghĩa cột cho Bảng Top món ăn
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

    // Định nghĩa cột cho Bảng danh sách đơn hàng trong Modal
    const modalOrderColumns: Column<OrderItem>[] = [
        {
            key: 'id',
            title: 'Mã ĐH',
            render: (item) => <strong>#{item.id}</strong>
        },
        {
            key: 'customer',
            title: 'Khách hàng',
            render: (item) => (
                <div className="customer-cell">
                    <span className="customer-name">{item.receiverName || 'Khách đặt tại quán'}</span>
                    <span className="customer-phone">{item.receiverPhone}</span>
                </div>
            )
        },
        {
            key: 'orderTime',
            title: 'Thời gian đặt',
            render: (order) => new Date(order.orderTime).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
        },
        {
            key: 'total',
            title: 'Tổng tiền',
            render: (item) => (
                <strong className="price-text">
                    {(Number(item.total) || 0).toLocaleString('vi-VN')} đ
                </strong>
            )
        },
        {
            key: 'status',
            title: 'Trạng thái',
            render: (item) => (
                <span className={`quick-status-select status-${item.status.toLowerCase()}`} style={{ cursor: 'default' }}>
                    {ORDER_STATUS_MAP[item.status] || item.status}
                </span>
            )
        }
    ];

    if (isLoading) {
        return <div className="dashboard-container" style={{ padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="dashboard-container" style={{ padding: '20px', color: 'red' }}>Lỗi: {error}</div>;
    }

    const handleOpenBillDetail = async (order: OrderItem) => {
        try {
            setIsBillOpen(false);

            const response = await axiosClient.get(`/orders/${order.id}`);
            const orderData = response.data?.data || response.data;

            const cashierName =
                orderData.cashierName ||
                orderData.bill?.cashier?.fullName ||
                localStorage.getItem('user_name') ||
                'Thu ngân Dashboard';

            const discountVal =
                orderData.bill?.discount ||
                orderData.discount ||
                0;

            const formattedDishes = (orderData.orderedDishes || []).map((item: any) => ({
                id: item.id,
                dish: item.dish,
                price: item.price,
                quantity: item.quantity,
                subTotal: item.price * item.quantity,
            }));

            const totalQty =
                orderData.totalQuantity ||
                formattedDishes.reduce(
                    (sum: number, item: any) => sum + item.quantity,
                    0
                );

            const billData: BillModel = {
                id: Number(orderData.bill?.id || orderData.id),
                orderId: Number(orderData.id),
                paymentTime:
                    orderData.bill?.paymentTime ||
                    orderData.orderTime ||
                    new Date().toISOString(),
                paymentMethod:
                    orderData.bill?.paymentMethod ||
                    orderData.paymentMethod ||
                    'CASH',
                discount: discountVal,
                total: Math.max(
                    0,
                    Number(orderData.total || 0) - discountVal
                ),
                cashier: {
                    fullName: cashierName,
                },
                promotion: discountVal > 0
                    ? {
                        code: orderData.promotion?.code || 'KM_DASHBOARD',
                        value: discountVal,
                        type: 'DISCOUNT',
                    }
                    : null,
                order: {
                    totalQuantity: totalQty,
                    orderedDishes: formattedDishes,
                },
            };

            setSelectedOrder(billData);
            setIsBillOpen(true);

        } catch (err: any) {
            console.error('Lỗi tải chi tiết đơn hàng:', err);

            setModalError(
                err.response?.data?.message ||
                'Không thể tải chi tiết hóa đơn.'
            );

            // Không mở BillSummary nếu API thất bại
            setIsBillOpen(false);

        } finally {
            setIsModalLoading(false);
        }
    };

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

            {/* Khu vực biểu đồ doanh thu */}
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
                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
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
                        onRowClick={(product) => {
                            setSelectedProduct(product);
                            setIsModalOpen(true);
                        }}
                    />
                </div>
            </div>

            {/* Modal hiển thị danh sách đơn hàng của món ăn đã chọn */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedProduct ? `Danh sách đơn hàng có ${selectedProduct.name}` : 'Danh sách đơn hàng'}
                maxWidth="850px"
            >
                <div style={{ padding: '8px 0' }}>
                    {isModalLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: '#666' }}>
                            Đang tải danh sách đơn hàng...
                        </div>
                    ) : modalError ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: 'red' }}>
                            {modalError}
                        </div>
                    ) : (
                        <DataTable
                            columns={modalOrderColumns}
                            data={productOrders}
                            emptyMessage="Không tìm thấy đơn hàng nào cho món ăn này"
                            onRowClick={(order) => handleOpenBillDetail(order)}
                        />
                    )}
                </div>
            </Modal>

            {/* Chi tiết hóa đơn */}
            {isBillOpen && selectedOrder && (
                <BillSummary
                    bill={selectedOrder}
                    isOpen={isBillOpen}
                    onClose={() => setIsBillOpen(false)}
                    onPrint={() => {
                        window.print();
                    }}
                />
            )}
        </div>
    );
};

export default DashboardView;