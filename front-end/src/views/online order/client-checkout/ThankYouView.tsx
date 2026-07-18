import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../../../api/axios';
import './ThankYouView.css';

interface OrderState {
    orderId: number;
    paymentMethod?: string;
    order?: {
        totalAmount?: number;
        fullName?: string;
        phone?: string;
        address?: string;
    };
    totalPay?: number;
    receiverName?: string;
    receiverPhone?: string;
    shippingAddress?: string;
}

// Thêm interface cho dữ liệu fetch từ API
interface FetchedOrderInfo {
    fullName?: string;
    phone?: string;
    address?: string;
}

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

const ThankYouView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [fetchedOrderInfo, setFetchedOrderInfo] = useState<FetchedOrderInfo | null>(null);

    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const vnpTxnRef = searchParams.get('vnp_TxnRef');
    const vnpAmount = searchParams.get('vnp_Amount');

    // Nếu trên URL có mã VNPAY thì đây là luồng VNPAY
    const isVnpayFlow = vnpResponseCode !== null;

    const isSuccess = isVnpayFlow ? vnpResponseCode === '00' : true;

    // Lấy dữ liệu nội bộ (Dành cho COD)
    const orderData = location.state as OrderState | null;

    // Hợp nhất dữ liệu hiển thị giữa VNPAY và COD
    const finalOrderId = isVnpayFlow ? vnpTxnRef : orderData?.orderId;

    useEffect(() => {
        if (isVnpayFlow && isSuccess && finalOrderId) {
            const fetchOrderDetails = async () => {
                try {
                    const response = await axiosClient.get(`/orders/${finalOrderId}`);
                    const data = response.data;
                    if (data) {
                        setFetchedOrderInfo({
                            fullName: data.receiverName,
                            phone: data.receiverPhone,
                            address: data.shippingAddress,
                        });
                    }
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin đơn hàng:", error);
                }
            };

            fetchOrderDetails();
        }
    }, [isVnpayFlow, isSuccess, finalOrderId]);

    // Xử lý khi truy cập sai luồng (Không có VNPAY params và không có state)
    if (!isVnpayFlow && !orderData) {
        return (
            <div className="ty-container is-error">
                <div className="ty-error-card">
                    <div className="ty-icon-box">
                        <svg className="ty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    // VNPAY nhân số tiền lên 100 lần, nên cần chia lại cho 100
    const finalTotalPay = isVnpayFlow
        ? (vnpAmount ? Number(vnpAmount) / 100 : 0)
        : (orderData?.order?.totalAmount || orderData?.totalPay || 0);

    // Cập nhật lại các biến này để ưu tiên dữ liệu từ API (nếu có)
    const finalReceiverName = orderData?.order?.fullName || orderData?.receiverName || fetchedOrderInfo?.fullName || 'Đang cập nhật...';
    const finalPhone = orderData?.order?.phone || orderData?.receiverPhone || fetchedOrderInfo?.phone || 'Đang cập nhật...';
    const finalAddress = orderData?.order?.address || orderData?.shippingAddress || fetchedOrderInfo?.address || 'Đang cập nhật...';
    const methodDisplay = isVnpayFlow ? 'Thanh toán trực tuyến (VNPAY)' : 'Thanh toán khi nhận hàng (COD)';

    return (
        <div className={`ty-container ${!isSuccess ? 'is-error' : ''}`}>
            <div className="ty-card">

                <div className="ty-header">
                    <div className="ty-icon-box">
                        {isSuccess ? (
                            <svg className="ty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="ty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <h1 className="ty-title">
                        {isSuccess
                            ? (isVnpayFlow ? 'Thanh toán thành công!' : 'Đặt hàng thành công!')
                            : 'Thanh toán thất bại'}
                    </h1>
                    <p className="ty-desc">
                        {isSuccess ? (
                            <>
                                Yêu cầu của bạn đã được tiếp nhận.
                                <br />
                                Chúng tôi sẽ liên hệ để xác nhận trong thời gian sớm nhất.
                            </>
                        ) : (
                            <>
                                Giao dịch qua cổng VNPAY đã bị hủy hoặc gặp sự cố.
                                <br />
                                Vui lòng kiểm tra lại.
                            </>
                        )}
                    </p>
                </div>

                {/* Tóm tắt thông tin hóa đơn */}
                <div className="ty-summary">
                    <div className="ty-row">
                        <span className="ty-label">Mã đơn hàng:</span>
                        <span className="ty-val">#{finalOrderId}</span>
                    </div>
                    <div className="ty-row">
                        <span className="ty-label">Trạng thái:</span>
                        <span className={`ty-badge ${isSuccess ? 'success' : 'danger'}`}>
                            {isSuccess ? 'Đã ghi nhận' : 'Lỗi thanh toán'}
                        </span>
                    </div>
                    <div className="ty-row">
                        <span className="ty-total-label">Số tiền:</span>
                        <span className="ty-total-val">{finalTotalPay.toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>

                {/* Thông tin giao nhận (Chỉ hiện nếu thành công) */}
                {isSuccess && (
                    <>
                        <h3 className="ty-delivery-title">Địa chỉ nhận hàng</h3>
                        <div className="ty-delivery-details">
                            <div className="ty-delivery-item">Người nhận: <strong>{finalReceiverName}</strong></div>
                            <div className="ty-delivery-item">Số điện thoại: <strong>{finalPhone}</strong></div>
                            <div className="ty-delivery-item">Địa chỉ: <strong>{finalAddress}</strong></div>
                            <div className="ty-delivery-item">Hình thức: <strong>{methodDisplay}</strong></div>
                        </div>
                    </>
                )}

                {/* Nút điều hướng */}
                <div className="ty-actions">
                    {!isSuccess ? (
                        <>
                            <button onClick={() => handleRetryCheckout(Number(finalOrderId))} className="ty-btn ty-btn-fill">
                                Thử thanh toán lại
                            </button>
                            <button onClick={() => navigate('/')} className="ty-btn ty-btn-outline">
                                Quay về trang chủ
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate('/')} className="ty-btn ty-btn-outline">
                                Tiếp tục mua sắm
                            </button>
                            <button onClick={() => navigate('/order-history')} className="ty-btn ty-btn-fill">
                                Lịch sử đơn hàng
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThankYouView;