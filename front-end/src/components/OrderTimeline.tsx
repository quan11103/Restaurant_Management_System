import { ClipboardList, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';
import './OrderTimeline.css';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'COMPLETED';

interface OrderTimelineProps {
    currentStatus: OrderStatus | string;
}

export default function OrderTimeline({ currentStatus }: OrderTimelineProps) {
    // Định nghĩa thứ tự chuẩn của một đơn hàng bình thường
    const standardStages = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'];

    // Cấu hình các bước hiển thị trên UI
    const steps = [
        { key: 'PENDING', label: 'Chờ xác nhận', icon: ClipboardList },
        { key: 'PROCESSING', label: 'Đang xử lý', icon: Package },
        { key: 'SHIPPED', label: 'Đang giao hàng', icon: Truck },
        { key: 'DELIVERED', label: 'Đã giao hàng', icon: CheckCircle2 },
    ];

    // Hàm xác định trạng thái của từng bước (completed, active, inactive, cancelled)
    const getStepStatus = (stepKey: string, index: number) => {
        if (currentStatus === 'CANCELLED') {
            return 'cancelled';
        }

        const currentIndex = standardStages.indexOf(currentStatus as string);
        const stepIndex = standardStages.indexOf(stepKey);

        // Gom DELIVERED và COMPLETED vào chung một mốc cuối cùng
        if (stepKey === 'DELIVERED' && currentStatus === 'COMPLETED') {
            return 'completed';
        }

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'inactive';
    };

    return (
        <div className="timeline-container">
            {currentStatus === 'CANCELLED' ? (
                // Hiển thị giao diện đặc biệt khi đơn hàng đã bị hủy
                <div className="timeline-step cancelled">
                    <div className="step-icon-wrapper">
                        <XCircle size={24} />
                    </div>
                    <div className="step-content">
                        <span className="step-label">Đơn hàng đã bị hủy</span>
                    </div>
                </div>
            ) : (
                // Hiển thị tiến trình bình thường
                steps.map((step, index) => {
                    const status = getStepStatus(step.key, index);
                    const Icon = step.icon;
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step.key} className={`timeline-step ${status}`}>
                            {/* Đường nối giữa các bước */}
                            {!isLast && <div className="step-connector"></div>}

                            <div className="step-icon-wrapper">
                                <Icon size={22} strokeWidth={status === 'active' ? 2.5 : 2} />
                            </div>

                            <div className="step-content">
                                <span className="step-label">{step.label}</span>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}