import Badge, { type BadgeVariant } from './Badge';
import Button from './Button';
import './OrderCard.css';

interface OrderCardProps {
    order: any;
    onActionClick: (action: string, orderId: string) => void;
}

export default function OrderCard({ order, onActionClick }: OrderCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusColor = (status: string): BadgeVariant => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'PROCESSING': return 'info';
            case 'SHIPPED': return 'primary';
            case 'DELIVERED':
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'danger';
            default: return 'default';
        }
    };

    return (
        <div className="order-card">
            <div className="order-card-header">
                <span className="order-card-id">#{order.id}</span>
                <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
            </div>

            <div className="order-card-date">
                Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
            </div>

            <div className="order-card-total">
                Tổng tiền: <span className="order-card-amount">{formatCurrency(order.totalPay || order.total)}</span>
            </div>

            <div className="order-card-actions">
                {/* Đã bỏ size="sm" để đúng với ButtonProps */}
                <Button variant="outline" onClick={() => onActionClick('VIEW', order.id)}>
                    Xem chi tiết
                </Button>
                {order.status === 'PENDING' && order.bill?.paymentStatus === 'UNPAID' && (
                    <Button variant="primary" onClick={() => onActionClick('RETRY_PAYMENT', order.id)}>
                        Thanh toán lại
                    </Button>
                )}
            </div>
        </div>
    );
}