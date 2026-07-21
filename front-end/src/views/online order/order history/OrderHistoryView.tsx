import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import axiosClient from '../../../api/axios';
import { Package } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import SearchBar from '../../../components/SearchBar';
import SelectBox from '../../../components/SelectBox';
import DataTable, { type Column } from '../../../components/DataTable';
import EmptyState from '../../../components/EmptyState';
import Badge, { type BadgeVariant } from '../../../components/Badge';
import Button from '../../../components/Button';
import Pagination from '../../../components/Pagination';
import OrderCard from '../../../components/OrderCard';
import './OrderHistoryView.css';

interface OrderRecord {
    id: string;
    orderTime: string;
    totalPay?: number;
    total: number;
    status: string;
    bill?: {
        paymentStatus: string;
        paymentMethod: string;
    };
}

export default function OrderHistoryView() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    const statusOptions = [
        { label: 'Tất cả đơn hàng', value: 'ALL' },
        { label: 'Chờ xác nhận', value: 'PENDING' },
        { label: 'Đang xử lý', value: 'PROCESSING' },
        { label: 'Đang giao', value: 'SHIPPED' },
        { label: 'Đã giao', value: 'DELIVERED' },
        { label: 'Hoàn tất', value: 'COMPLETED' },
        { label: 'Đã hủy', value: 'CANCELLED' },
    ];

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, currentPage, searchTerm]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/orders/history', {
                params: {
                    status: statusFilter,
                    search: searchTerm,
                    page: currentPage,
                    limit: 10
                }
            });

            setOrders(response.data.data);
            setCurrentPage(response.data.pagination.currentPage);
            setTotalPages(response.data.pagination.totalPages || 1);
        } catch (error) {
            console.error("Lỗi khi tải lịch sử đơn hàng", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRetryCheckout = async (orderId: number) => {
        try {
            const response = await axiosClient.post('/orders/retry-checkout', {
                orderId: orderId
            });

            if (response.data && response.data.success && response.data.paymentUrl) {
                window.location.href = response.data.paymentUrl;
            }
        } catch (error) {
            console.error("Lỗi khi thanh toán lại đơn hàng:", error);
        }
    };

    const handleOrderAction = (action: string, orderId: string) => {
        if (action === 'VIEW') {
            navigate(`/order-detail/${orderId}`);
        } else if (action === 'RETRY_PAYMENT') {
            handleRetryCheckout(Number(orderId));
        }
    };

    const handleBack = () => {
        window.history.back();
    };

    const tableColumns: Column<OrderRecord>[] = [
        {
            key: 'id',
            title: 'Mã ĐH',
            render: (order) => <strong>#{order.id}</strong>
        },
        {
            key: 'orderTime',
            title: 'Thời gian đặt',
            render: (order) => {
                return new Date(order.orderTime).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
            }
        },
        {
            key: 'totalPay',
            title: 'Tổng tiền',
            render: (order) => (
                <span style={{ color: '#ef4444', fontWeight: 500 }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPay || order.total)}
                </span>
            )
        },
        {
            key: 'status',
            title: 'Trạng thái',
            render: (order) => {
                const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
                    PENDING: { label: 'Chờ xác nhận', variant: 'warning' },
                    PROCESSING: { label: 'Đang xử lý', variant: 'info' },
                    SHIPPED: { label: 'Đang giao hàng', variant: 'primary' },
                    DELIVERED: { label: 'Đã giao hàng', variant: 'success' },
                    COMPLETED: { label: 'Hoàn thành', variant: 'success' },
                    CANCELLED: { label: 'Đã hủy', variant: 'danger' },
                };

                const config = statusConfig[order.status] || { label: order.status, variant: 'default' };

                return <Badge variant={config.variant}>{config.label}</Badge>;
            }
        },
        {
            key: 'actions',
            title: 'Thao tác',
            render: (order) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button size="sm" variant="outline" onClick={() => handleOrderAction('VIEW', order.id)}>
                        Xem chi tiết
                    </Button>
                    {order.bill?.paymentMethod === 'TRANSFER' && order.status === 'PENDING' && order.bill?.paymentStatus === 'UNPAID' && (
                        <Button size="sm" variant="primary" onClick={() => handleOrderAction('RETRY_PAYMENT', order.id)}>
                            Thanh toán
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="order-history-container">
            <PageHeader
                title="Lịch sử đặt hàng"
                showBackButton={true}
                onBack={handleBack}
                extraActions={
                    <Button variant="outline" onClick={() => window.location.href = '/'}>
                        Tiếp tục mua sắm
                    </Button>
                }
            />

            <div className="order-history-toolbar">
                <div className="toolbar-search">
                    <SearchBar
                        placeholder="Tìm theo mã đơn hàng..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                </div>
                <div className="toolbar-filter">
                    <SelectBox
                        options={statusOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Đang tải dữ liệu...</div>
            ) : (
                <>
                    {orders.length === 0 ? (
                        <EmptyState
                            icon={<Package size={40} strokeWidth={1.5} />}
                            title="Chưa có đơn hàng nào"
                            message="Bạn chưa có đơn hàng nào khớp với điều kiện tìm kiếm."
                            actionText="Tiếp tục mua sắm"
                            actionHref="/"
                        />
                    ) : (
                        <>
                            <div className="desktop-view">
                                <DataTable columns={tableColumns} data={orders} emptyMessage="Không tìm thấy đơn hàng nào" />
                            </div>

                            <div className="mobile-view">
                                {orders.map((order: any) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onActionClick={handleOrderAction}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="pagination-wrapper">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </>
            )}
        </div>
    );
}