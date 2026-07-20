import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import axiosClient from '../../../api/axios';
// Import các component dùng chung
import PageHeader from '../../../components/PageHeader';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import DataTable from '../../../components/DataTable';
import ConfirmModal from '../../../components/ConfirmModal';
import EmptyState from '../../../components/EmptyState';
// Các component bổ sung
import OrderTimeline from '../../../components/OrderTimeline';
import InfoCard from '../../../components/InfoCard';
import OrderSummaryBox from '../../../components/OrderSummaryBox';

// Import file style tách biệt
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

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const response = await axiosClient.get(`/orders/${id}`)

                const data = response.data;

                // Tự động tính toán subTotal dựa trên danh sách món ăn (orderedDishes)
                const calculatedSubTotal = (data.orderedDishes || []).reduce(
                    (sum: number, item: any) => sum + (item.price * item.quantity),
                    0
                );

                // Ánh xạ chính xác theo cấu trúc JSON response mới
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
                    shippingFee: 0, // Hiện tại cấu trúc API chưa trả về phí ship, tạm thời gán bằng 0
                    discount: data.bill?.discount || 0,
                    totalPay: data.total || 0
                };

                setOrder(mappedOrder);
            } catch (error) {
                console.error('Lỗi fetch chi tiết đơn hàng:', error);
                setOrder(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetail();
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
        console.log('Đã gửi yêu cầu hủy đơn lên server cho mã:', id);
        setIsCancelModalOpen(false);
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
            alert(error.message);
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
                        {/* Nút thanh toán lại chỉ khả dụng nếu đơn hàng đang PENDING, chưa thanh toán và chọn phương thức TRANSFER */}
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
                            <Button variant="primary" onClick={() => navigate(`/cart`)} fullWidth>
                                Mua lại đơn này
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