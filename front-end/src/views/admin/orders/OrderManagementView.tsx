import React, { useState, useEffect, useRef } from 'react';
import { Eye, XCircle, RefreshCw } from 'lucide-react';
import axiosClient from '../../../api/axios';
import { useAlert } from '../../../components/Alert';
import { type SelectOption } from '../../../components/SelectBox';
import DataTable, { type Column } from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import ConfirmModal from '../../../components/ConfirmModal';
import OrderTimeline from '../../../components/OrderTimeline';
import InfoCard from '../../../components/InfoCard';
import OrderSummaryBox from '../../../components/OrderSummaryBox';
import OrderFilterBar from './OrderFilterBar';
import Pagination from '../../../components/Pagination';
import './OrderManagementView.css';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'COMPLETED';

export interface OrderItem {
    id: string;
    receiverName: string;
    receiverPhone: string;
    orderTime: string;
    total: number;
    status: OrderStatus;
    paymentMethod: string;
    shippingAddress: string;
    bill?: {
        paymentMethod: string;
    };
}

const ORDER_STATUS_LIST: { label: string; value: OrderStatus }[] = [
    { label: 'Chờ xác nhận', value: 'PENDING' },
    { label: 'Đang xử lý', value: 'PROCESSING' },
    { label: 'Đang giao', value: 'SHIPPED' },
    { label: 'Đã giao', value: 'DELIVERED' },
    { label: 'Hoàn thành', value: 'COMPLETED' },
    { label: 'Đã hủy', value: 'CANCELLED' },
];

const statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: 'Tất cả' },
    ...ORDER_STATUS_LIST
];

const OrderManagementView: React.FC = () => {
    const { showAlert } = useAlert();

    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('Tất cả');

    // State quản lý phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get('/orders', {
                params: {
                    status: selectedStatus === 'Tất cả' ? 'ALL' : selectedStatus,
                    search: searchTerm,
                    page: currentPage,
                    limit: 10
                }
            });

            const data = response.data.data || response.data;
            setOrders(Array.isArray(data) ? data : []);

            if (response.data.pagination) {
                setCurrentPage(response.data.pagination.currentPage || 1);
                setTotalPages(response.data.pagination.totalPages || 1);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách đơn hàng:", error);
            showAlert('error', 'Không thể tải danh sách đơn hàng từ hệ thống', 'Lỗi');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [selectedStatus, currentPage, searchTerm]);

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (status: string) => {
        setSelectedStatus(status);
        setCurrentPage(1);
    };

    const handleOpenQuickView = async (order: OrderItem) => {
        try {
            const response = await axiosClient.get(`/orders/${order.id}`);
            const orderDetail = response.data.data || response.data;
            setSelectedOrder(orderDetail);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            setSelectedOrder(order);
        } finally {
            setIsViewModalOpen(true);
        }
    };

    const handleOpenCancelModal = (order: OrderItem) => {
        setSelectedOrder(order);
        setIsCancelModalOpen(true);
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const response = await axiosClient.patch(`/orders/${orderId}/status`, {
                status: newStatus
            });

            if (response.data) {
                setOrders(prevOrders =>
                    prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
                );

                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
                }

                const statusLabel = ORDER_STATUS_LIST.find(s => s.value === newStatus)?.label || newStatus;
                showAlert('success', `Đã chuyển trạng thái đơn ${orderId} sang "${statusLabel}"`, 'Thành công');
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
            showAlert('error', 'Không thể cập nhật trạng thái đơn hàng', 'Lỗi');
        }
    };

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;

        try {
            const response = await axiosClient.patch(`/orders/${selectedOrder.id}/cancel-manager`);
            if (response.data) {
                setOrders(prevOrders =>
                    prevOrders.map(o => o.id === selectedOrder.id ? { ...o, status: 'CANCELLED' } : o)
                );

                if (selectedOrder) {
                    setSelectedOrder(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
                }

                showAlert('success', `Đã hủy đơn hàng ${selectedOrder.id}`, 'Thành công');
            }
        } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            showAlert('error', 'Không thể hủy đơn hàng', 'Lỗi');
        } finally {
            setIsCancelModalOpen(false);
        }
    };

    const columns: Column<OrderItem>[] = [
        { key: 'id', title: 'Mã ĐH', render: (item) => <strong>#{item.id}</strong> },
        {
            key: 'customer',
            title: 'Khách hàng',
            render: (item) => (
                <div className="customer-cell">
                    <span className="customer-name">{item.receiverName}</span>
                    <span className="customer-phone">{item.receiverPhone}</span>
                </div>
            )
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
                <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as OrderStatus)}
                    className={`quick-status-select status-${item.status.toLowerCase()}`}
                >
                    {ORDER_STATUS_LIST.map(st => (
                        <option key={st.value} value={st.value}>
                            {st.label}
                        </option>
                    ))}
                </select>
            )
        },
        {
            key: 'actions',
            title: 'Thao tác',
            render: (item) => (
                <div className="action-buttons">
                    <button className="btn-action view" onClick={() => handleOpenQuickView(item)} title="Xem chi tiết">
                        <Eye size={18} />
                    </button>
                    {item.status === 'PENDING' && (
                        <button className="btn-action cancel" onClick={() => handleOpenCancelModal(item)} title="Hủy đơn">
                            <XCircle size={18} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const topRef = useRef<HTMLDivElement>(null);

    return (
        <div className="order-management-view">

            <div className="view-header">
                <div>
                    <h1 className="view-title">Quản lí đơn hàng</h1>
                    <p className="view-subtitle">Theo dõi và xử lí các đơn đặt hàng của hệ thống</p>
                </div>
            </div>

            <OrderFilterBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                selectedStatus={selectedStatus}
                onStatusChange={handleStatusFilterChange}
                statusOptions={statusOptions}
            />

            <div className="view-content" ref={topRef}>
                <DataTable
                    columns={columns}
                    data={orders}
                    emptyMessage={isLoading ? "Đang tải danh sách đơn hàng..." : "Không tìm thấy đơn hàng nào khớp với bộ lọc"}
                />
            </div>

            <div className="pagination-wrapper">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        topRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        });
                    }}
                />
            </div>

            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={`Chi tiết đơn hàng: ${selectedOrder?.id}`}
                maxWidth="800px"
            >
                {selectedOrder && (
                    <div className="quick-view-container">

                        <div className="timeline-section">
                            <OrderTimeline currentStatus={selectedOrder.status} />
                        </div>

                        <div className="status-update-bar">
                            <div className="status-update-title">
                                <RefreshCw size={18} />
                                <span>Cập nhật trạng thái đơn hàng:</span>
                            </div>
                            <select
                                value={selectedOrder.status}
                                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                                className={`status-update-select status-${selectedOrder.status.toLowerCase()}`}
                            >
                                {ORDER_STATUS_LIST.map(st => (
                                    <option key={st.value} value={st.value}>
                                        {st.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="quick-view-grid">
                            <div className="info-column">
                                <InfoCard title="Thông tin giao hàng">
                                    <div className="order-info-details">
                                        <div className="info-row">
                                            <span className="info-label">Người nhận:</span>
                                            <span className="info-value">{selectedOrder.receiverName}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Số điện thoại:</span>
                                            <span className="info-value">{selectedOrder.receiverPhone}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Địa chỉ:</span>
                                            <span className="info-value">{selectedOrder.shippingAddress}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Phương thức thanh toán:</span>
                                            <span className="info-value">{selectedOrder.bill.paymentMethod}</span>
                                        </div>
                                    </div>
                                </InfoCard>
                            </div>

                            <div className="summary-column">
                                <OrderSummaryBox
                                    subTotal={selectedOrder.total}
                                    shippingFee={0}
                                    discount={0}
                                    totalPay={selectedOrder.total}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmModal
                isOpen={isCancelModalOpen}
                title="Xác nhận hủy đơn hàng"
                message={`Bạn có chắc chắn muốn hủy đơn hàng ${selectedOrder?.id} của khách hàng ${selectedOrder?.receiverName} không? Hành động này không thể hoàn tác.`}
                confirmLabel="Hủy đơn hàng này"
                cancelLabel="Đóng"
                onConfirm={handleCancelOrder}
                onCancel={() => setIsCancelModalOpen(false)}
            />
        </div>
    );
};

export default OrderManagementView;