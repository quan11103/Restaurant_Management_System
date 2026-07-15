import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ThankYouView.css';

// Tối ưu lại Interface: Nhận nguyên object order từ backend trả về
interface OrderState {
    orderId: number;
    paymentMethod?: string;
    order?: {
        totalAmount?: number;      // Đổi thành tên trường thường dùng từ DB
        fullName?: string;         // Đổi tương ứng
        phone?: string;
        address?: string;
    };
    // Giữ lại các trường cũ phòng trường hợp bạn truyền dạng phẳng (flat)
    totalPay?: number;
    receiverName?: string;
    receiverPhone?: string;
    shippingAddress?: string;
}

const ThankYouView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const orderData = location.state as OrderState | null;

    // Xử lý khi truy cập trực tiếp URL
    if (!orderData) {
        return (
            <div className="ty-container">
                <div className="ty-error-card">
                    <div className="ty-icon-box" style={{ backgroundColor: '#fef2f2' }}>
                        <svg className="ty-icon" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="ty-title" style={{ fontSize: '18px' }}>Không tìm thấy đơn hàng</h2>
                    <p className="ty-desc" style={{ marginBottom: '24px' }}>
                        Bạn vừa truy cập trực tiếp vào trang này mà chưa thực hiện quy trình đặt hàng.
                    </p>
                    <button onClick={() => navigate('/')} className="ty-btn ty-btn-fill" style={{ width: '100%' }}>
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    // Tự động lấy dữ liệu (Ưu tiên lấy từ object `order` nếu có, không thì lấy trường lẻ)
    const { orderId, order, paymentMethod } = orderData;
    const finalTotalPay = order?.totalAmount || orderData.totalPay || 0;
    const finalReceiverName = order?.fullName || orderData.receiverName || 'Chưa cập nhật';
    const finalPhone = order?.phone || orderData.receiverPhone || 'Chưa cập nhật';
    const finalAddress = order?.address || orderData.shippingAddress || 'Nhận tại cửa hàng';

    return (
        <div className="ty-container">
            <div className="ty-card">
                {/* Phần đầu chúc mừng */}
                <div className="ty-header">
                    <div className="ty-icon-box">
                        <svg className="ty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="ty-title">Đặt hàng thành công!</h1>
                    <p className="ty-desc">
                        Yêu cầu của bạn đã được tiếp nhận. Chúng tôi sẽ liên hệ để xác nhận trong thời gian sớm nhất.
                    </p>
                </div>

                {/* Thông tin hóa đơn đơn giản */}
                <div className="ty-summary">
                    <div className="ty-row">
                        <span className="ty-label">Mã đơn hàng:</span>
                        <span className="ty-val">#{orderId}</span>
                    </div>
                    <div className="ty-row">
                        <span className="ty-label">Trạng thái:</span>
                        <span className="ty-badge">Chờ xác nhận</span>
                    </div>
                    <hr className="ty-divider" />
                    <div className="ty-row">
                        <span className="ty-total-label">Số tiền cần trả:</span>
                        <span className="ty-total-val">{finalTotalPay.toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>

                {/* Thông tin giao nhận */}
                <h3 className="ty-delivery-title">Địa chỉ nhận hàng</h3>
                <div className="ty-delivery-details">
                    <div className="ty-delivery-item">
                        Người nhận: <strong>{finalReceiverName}</strong>
                    </div>
                    <div className="ty-delivery-item">
                        Số điện thoại: <strong>{finalPhone}</strong>
                    </div>
                    <div className="ty-delivery-item">
                        Địa chỉ: <strong>{finalAddress}</strong>
                    </div>
                    <div className="ty-delivery-item">
                        Hình thức: <strong>{paymentMethod === 'CASH' ? 'Thanh toán khi nhận hàng (COD)' : (paymentMethod || 'Chưa xác định')}</strong>
                    </div>
                </div>

                {/* Nút điều hướng */}
                <div className="ty-actions">
                    <button onClick={() => navigate('/')} className="ty-btn ty-btn-outline">
                        Tiếp tục mua sắm
                    </button>
                    <button onClick={() => navigate('/order-history')} className="ty-btn ty-btn-fill">
                        Lịch sử đơn hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThankYouView;