import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../../../api/axios';
import BillSummary, { type BillModel } from '../../checkout/checkout/BillSummary';
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

interface FetchedOrderInfo {
    fullName?: string;
    phone?: string;
    address?: string;
    orderType?: string;
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
    const [fullOrderData, setFullOrderData] = useState<any | null>(null);

    // State phục vụ việc xem/in hóa đơn (BillSummary Modal)
    const [showBillSummary, setShowBillSummary] = useState<boolean>(false);
    const [completedBillData, setCompletedBillData] = useState<BillModel | null>(null);

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
        if (isSuccess && finalOrderId) {
            const fetchOrderDetails = async () => {
                try {
                    const response = await axiosClient.get(`/orders/${finalOrderId}`);
                    const data = response.data;
                    if (data) {
                        setFullOrderData(data);
                        setFetchedOrderInfo({
                            fullName: data.receiverName || data.fullName,
                            phone: data.receiverPhone || data.phone,
                            address: data.shippingAddress || data.address,
                            orderType: data.orderType || data.order_type,
                        });
                    }
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin đơn hàng:", error);
                }
            };

            fetchOrderDetails();
        }
    }, [isSuccess, finalOrderId]);

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
        : (orderData?.order?.totalAmount || orderData?.totalPay || fullOrderData?.total || 0);

    // Kiểm tra xem đơn hàng có phải DINE_IN không
    const isDineIn = fetchedOrderInfo?.orderType === 'DINE_IN';

    const finalReceiverName = fetchedOrderInfo?.fullName || 'Đang cập nhật...';
    const finalPhone = fetchedOrderInfo?.phone || 'Đang cập nhật...';
    const finalAddress = fetchedOrderInfo?.address || 'Đang cập nhật...';
    const methodDisplay = isVnpayFlow ? 'Thanh toán trực tuyến (VNPAY)' : 'Thanh toán khi nhận hàng (COD)';

    // Hàm xử lý khi nhấn In Hóa Đơn (Tương tự CheckoutView)
    const handlePrintBill = () => {
        if (!fullOrderData) {
            alert('Đang tải dữ liệu hóa đơn, vui lòng thử lại sau giây lát!');
            return;
        }

        const billFromResponse = fullOrderData.bill;
        const cashierName = localStorage.getItem('user_name') || 'Nhân viên';

        const formattedBill: BillModel = {
            id: billFromResponse?.id || fullOrderData.id,
            orderId: fullOrderData.id,
            paymentTime: billFromResponse?.paymentTime || new Date().toISOString(),
            paymentMethod: billFromResponse?.paymentMethod || (isVnpayFlow ? 'TRANSFER' : 'CASH'),
            discount: billFromResponse?.discount || 0,
            total: finalTotalPay,
            cashier: {
                fullName: cashierName
            },
            promotion: fullOrderData.promotionCode ? {
                code: fullOrderData.promotionCode,
                value: billFromResponse?.discount || 0,
                type: 'DISCOUNT',
            } : null,
            order: {
                totalQuantity: fullOrderData.totalQuantity || fullOrderData.orderedDishes?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
                orderedDishes: (fullOrderData.orderedDishes || []).map((item: any) => ({
                    id: item.id,
                    dish: item.dish,
                    price: item.price,
                    quantity: item.quantity,
                    subTotal: item.price * item.quantity,
                }))
            }
        };

        setCompletedBillData(formattedBill);
        setShowBillSummary(true);
    };

    const handleCloseBill = () => {
        setShowBillSummary(false);
    };

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
                            isDineIn ? (
                                <>
                                    Cảm ơn bạn đã đặt món tại nhà hàng!
                                </>
                            ) : (
                                <>
                                    Yêu cầu của bạn đã được tiếp nhận.
                                    <br />
                                    Chúng tôi sẽ liên hệ để xác nhận trong thời gian sớm nhất.
                                </>
                            )
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
                        <h3 className="ty-delivery-title">
                            {isDineIn ? 'Thông tin khách hàng' : 'Địa chỉ nhận hàng'}
                        </h3>
                        <div className="ty-delivery-details">
                            <div className="ty-delivery-item">Người nhận: <strong>{finalReceiverName}</strong></div>
                            <div className="ty-delivery-item">Số điện thoại: <strong>{finalPhone}</strong></div>
                            {!isDineIn && (
                                <div className="ty-delivery-item">Địa chỉ: <strong>{finalAddress}</strong></div>
                            )}
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
                    ) : isDineIn ? (
                        <>
                            <button onClick={handlePrintBill} className="ty-btn ty-btn-outline">
                                In hóa đơn
                            </button>
                            <button onClick={() => navigate('/table-map')} className="ty-btn ty-btn-fill">
                                Hoàn tất
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

            {/* Modal hiển thị và in hóa đơn chi tiết */}
            {showBillSummary && completedBillData && (
                <BillSummary
                    bill={completedBillData}
                    onClose={handleCloseBill}
                    onPrint={() => {
                        window.print();
                    }}
                />
            )}
        </div>
    );
};

export default ThankYouView;