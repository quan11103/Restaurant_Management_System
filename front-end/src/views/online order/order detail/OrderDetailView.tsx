import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import axiosClient from '../../../api/axios';
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import DataTable from '../../../components/DataTable';
import ConfirmModal from '../../../components/ConfirmModal';
import EmptyState from '../../../components/EmptyState';
import OrderTimeline from '../../../components/OrderTimeline';
import InfoCard from '../../../components/InfoCard';
import OrderSummaryBox from '../../../components/OrderSummaryBox';
import { useAlert } from '../../../components/Alert';
import './OrderDetailView.css';

interface OrderItem {
    id: string;
    productName: string;
    price: number;
    quantity: number;
    total: number;
}

interface OrderDetail {
    id: string;
    orderTime: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'COMPLETED';
    paymentMethod: string;
    paymentStatus: 'PAID' | 'UNPAID' | 'FAILED';
    shippingAddress: {
        name: string;
        phone: string;
        address: string;
    };
    items: OrderItem[];
    subTotal: number;
    shippingFee: number;
    discount: number;
    totalPay: number;
}

export default function OrderDetailView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

    // Thêm state loading riêng cho action Reorder để không làm mất UI cũ khi đang gọi API
    const [isReordering, setIsReordering] = useState<boolean>(false);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const response = await axiosClient.get(`/orders/${id}`)
                const data = response.data;

                const calculatedSubTotal = (data.orderedDishes || []).reduce(
                    (sum: number, item: any) => sum + (item.price * item.quantity),
                    0
                );

                const mappedOrder: OrderDetail = {
                    id: data.id.toString(),
                    orderTime: data.orderTime,
                    status: data.status,
                    paymentMethod: data.bill?.paymentMethod || 'CASH',
                    paymentStatus: data.bill?.paymentStatus || 'UNPAID',
                    shippingAddress: {
                        name: data.receiverName || 'Chưa cập nhật',
                        phone: data.receiverPhone || 'Chưa cập nhật',
                        address: data.shippingAddress || 'Chưa cập nhật'
                    },
                    items: (data.orderedDishes || []).map((item: any) => ({
                        id: item.id.toString(),
                        productName: item.dish?.name || 'Món ăn',
                        price: item.price,
                        quantity: item.quantity,
                        total: item.price * item.quantity
                    })),
                    subTotal: calculatedSubTotal,
                    shippingFee: 0,
                    discount: data.bill?.discount || 0,
                    totalPay: data.total || 0
                };

                setOrder(mappedOrder);
            } catch (error) {
                console.error('Lỗi fetch chi tiết đơn hàng:', error);
                showAlert('error', 'Đã xảy ra lỗi khi tải thông tin đơn hàng!', 'Lỗi hệ thống');
                setOrder(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const itemColumns = [
        { key: 'productName', title: 'Sản phẩm', render: (item: OrderItem) => item.productName },
        { key: 'price', title: 'Đơn giá', render: (item: OrderItem) => formatCurrency(item.price) },
        { key: 'quantity', title: 'Số lượng', render: (item: OrderItem) => item.quantity },
        { key: 'total', title: 'Thành tiền', render: (item: OrderItem) => <strong>{formatCurrency(item.total)}</strong> }
    ];

    const handleCancelOrder = async () => {
        if (!id) return;

        try {
            await axiosClient.patch(`/orders/${id}/cancel`);
            setIsCancelModalOpen(false);
            showAlert('success', 'Đã hủy đơn hàng thành công!', 'Thành công');
            setOrder(prevOrder => prevOrder ? { ...prevOrder, status: 'CANCELLED' } : null);
        } catch (error: any) {
            console.error('Lỗi khi hủy đơn hàng:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra, không thể hủy đơn hàng lúc này.';
            showAlert('error', errorMessage, 'Lỗi hệ thống');
            setIsCancelModalOpen(false);
        }
    };

    const handleRetryPayment = async () => {
        if (!id) return;
        try {
            const response = await axiosClient.post('/orders/retry-checkout')
            const result = response.data;
            if (result.success && result.paymentUrl) {
                window.location.href = result.paymentUrl;
            }
        } catch (error: any) {
            console.error('Lỗi thanh toán lại:', error);
            showAlert('error', error.message || 'Không thể tiến hành thanh toán lúc này', 'Lỗi hệ thống');
        }
    };

    // Tích hợp logic xử lý Reorder
    const handleReorder = async () => {
        if (!id) return;

        try {
            setIsReordering(true); // Sử dụng state loading riêng cho nút bấm

            // 1. Gọi API backend (cần đảm bảo backend có route POST /cart/reorder/:orderId)
            await axiosClient.post(`/cart-item/reorder/${id}`);

            showAlert('success', 'Đã thêm các món vào giỏ hàng!', 'Thành công');

            // 2. Chuyển hướng sang trang Checkout (hoặc trang Giỏ hàng /cart)
            navigate('/client-checkout');
        } catch (error: any) {
            console.error('Lỗi khi đặt lại đơn hàng:', error);
            showAlert('error', error.response?.data?.message || 'Không thể đặt lại đơn hàng lúc này', 'Lỗi');
        } finally {
            setIsReordering(false);
        }
    };

    if (isLoading) {
        return <div className="order-detail-loading">Đang tải dữ liệu đơn hàng...</div>;
    }

    if (!order) {
        return (
            <EmptyState
                icon={<FileQuestion size={48} strokeWidth={1.5} />}
                title="Không tìm thấy đơn hàng"
                message="Mã đơn hàng không hợp lệ hoặc đơn hàng này không thuộc quyền sở hữu của bạn."
                actionText="Quay lại danh sách đơn hàng"
                onAction={() => navigate('/order-history')}
            />
        );
    }

    return (
        <div className="order-detail-container">
            <PageHeader
                title={`Chi tiết đơn hàng #${order.id}`}
                showBackButton={true}
                onBack={() => window.history.back()}
            />

            <div className="order-timeline-wrapper">
                <OrderTimeline currentStatus={order.status} />
            </div>

            <div className="order-detail-layout">
                {/* Cột trái: Danh sách sản phẩm */}
                <div className="order-main-content">
                    <div className="order-main-header">
                        <h3>Danh sách sản phẩm</h3>
                    </div>

                    <DataTable
                        columns={itemColumns}
                        data={order.items}
                    />
                </div>

                {/* Cột phải: Thông tin giao hàng & Tổng kết tiền */}
                <div className="order-sidebar">
                    <InfoCard title="Địa chỉ nhận hàng">
                        <p><strong>Người nhận: {order.shippingAddress.name}</strong></p>
                        <p>Điện thoại: {order.shippingAddress.phone}</p>
                        <p>Địa chỉ: {order.shippingAddress.address}</p>
                    </InfoCard>

                    <InfoCard title="Phương thức thanh toán">
                        <p>Phương thức: <strong>{order.paymentMethod === 'TRANSFER' ? 'Chuyển khoản (VNPAY)' : 'Tiền mặt (CASH)'}</strong></p>
                        <p className="payment-status-row">
                            Trạng thái:
                            <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'danger'}>
                                {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </Badge>
                        </p>
                    </InfoCard>

                    <OrderSummaryBox
                        subTotal={order.subTotal}
                        shippingFee={order.shippingFee}
                        discount={order.discount}
                        totalPay={order.totalPay}
                    />

                    <div className="order-action-buttons">
                        {order.status === 'PENDING' && order.paymentStatus !== 'PAID' && order.paymentMethod === 'TRANSFER' && (
                            <Button variant="primary" onClick={handleRetryPayment} fullWidth>
                                Thanh toán lại
                            </Button>
                        )}

                        {order.status === 'PENDING' && (
                            <Button variant="outline" onClick={() => setIsCancelModalOpen(true)} fullWidth>
                                Hủy đơn hàng
                            </Button>
                        )}

                        {(order.status === 'DELIVERED' || order.status === 'COMPLETED' || order.status === 'CANCELLED') && (
                            <Button
                                variant="primary"
                                onClick={handleReorder}
                                disabled={isReordering}
                                fullWidth
                            >
                                {isReordering ? 'Đang xử lý...' : 'Đặt lại đơn hàng'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isCancelModalOpen}
                title="Xác nhận hủy đơn hàng"
                message={`Bạn có chắc chắn muốn hủy đơn hàng #${order.id} không? Hành động này không thể hoàn tác.`}
                onConfirm={handleCancelOrder}
                onCancel={() => setIsCancelModalOpen(false)}
                confirmLabel="Đồng ý hủy"
                cancelLabel="Không, quay lại"
                type="danger"
            />
        </div>
    );
}