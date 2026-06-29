import React, { useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import DiscountApplier, { type AppliedDiscount } from './DiscountApplier';
import PaymentMethodSelector, { type PaymentMethod } from './PaymentMethodSelector';
import BillSummary, { type BillModel } from './BillSummary';
import './CheckOutView.css';

const MOCK_ORDER_DATA = {
    id: 5002,
    orderTime: new Date().toISOString(),
    totalQuantity: 4,
    total: 325000,
    orderTables: [{ table: { name: 'Bàn 03' } }],
    orderedDishes: [
        { id: 1, dish: { name: 'Bò bít tết sốt tiêu đen' }, price: 180000, quantity: 1, subTotal: 180000 },
        { id: 2, dish: { name: 'Salad cá ngừ' }, price: 85000, quantity: 1, subTotal: 85000 },
        { id: 3, dish: { name: 'Trà đào cam sả' }, price: 30000, quantity: 2, subTotal: 60000 },
    ]
};

const CheckOutView: React.FC = () => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
    const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
    // State quản lý hiển thị và dữ liệu Hóa đơn
    const [showBillSummary, setShowBillSummary] = useState(false);
    const [completedBillData, setCompletedBillData] = useState<BillModel | null>(null);
    // Tiền giảm giá lấy từ state
    const subTotal = MOCK_ORDER_DATA.total;
    const discountAmount = appliedDiscount?.discountAmount || 0;
    const finalTotal = subTotal - discountAmount;

    const handleCheckout = () => {
        // Trong thực tế, đoạn này bạn sẽ gọi API (POST /api/bills) để lưu xuống PostgreSQL
        // Sau khi API trả về thành công, lấy dữ liệu đó để nhét vào state.

        // Giả lập dữ liệu trả về từ Backend (Khớp chuẩn với BillModel)
        const newBill: BillModel = {
            id: Math.floor(Math.random() * 10000) + 9000, // Tạo mã HĐ ngẫu nhiên
            orderId: MOCK_ORDER_DATA.id,
            paymentTime: new Date().toISOString(),
            paymentMethod: paymentMethod,
            discount: discountAmount,
            total: finalTotal,
            cashier: { fullName: 'Admin Thu Ngân' }, // Lấy từ Session User
            promotion: appliedDiscount ? {
                code: appliedDiscount.code,
                value: discountAmount,
                type: 'UNKNOWN'
            } : null,
            order: {
                totalQuantity: MOCK_ORDER_DATA.totalQuantity,
                orderedDishes: MOCK_ORDER_DATA.orderedDishes
            }
        };

        // Lưu dữ liệu hóa đơn và bật Popup
        setCompletedBillData(newBill);
        setShowBillSummary(true);
    };

    const handleCloseBill = () => {
        setShowBillSummary(false);
        // Sau khi đóng bill thành công, thường sẽ redirect user về lại màn hình Sơ đồ bàn
        console.log('Quay về trang TableMapView...');
    };

    return (
        <div className="checkout-layout">
            <div className="checkout-header">
                <button className="btn-back">
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <h2>Thanh toán - {MOCK_ORDER_DATA.orderTables[0]?.table.name}</h2>
                <div style={{ width: 100 }}></div> {/* Spacer để căn giữa tiêu đề */}
            </div>

            <div className="checkout-content">
                {/* Cột trái: chi tiết lần gọi */}
                <div className="order-details-section">
                    <div className="order-meta">
                        <span><strong>Mã đơn:</strong> #{MOCK_ORDER_DATA.id}</span>
                        <span><strong>Thời gian:</strong> {new Date(MOCK_ORDER_DATA.orderTime).toLocaleTimeString('vi-VN')}</span>
                    </div>

                    <div className="ordered-items-list">
                        <div className="item-header">
                            <span className="col-name">Tên món</span>
                            <span className="col-qty">SL</span>
                            <span className="col-price">Đơn giá</span>
                            <span className="col-subtotal">Thành tiền</span>
                        </div>

                        {MOCK_ORDER_DATA.orderedDishes.map((item) => (
                            <div key={item.id} className="item-row">
                                <span className="col-name">{item.dish.name}</span>
                                <span className="col-qty">{item.quantity}</span>
                                <span className="col-price">{item.price.toLocaleString('vi-VN')}</span>
                                <span className="col-subtotal">{item.subTotal.toLocaleString('vi-VN')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cột phải: bảng tính tiền & thanh toán */}
                <div className="payment-section">
                    {/* Phần tính tiền */}
                    <div className="summary-block">
                        <div className="summary-row">
                            <span>Tổng tiền hàng ({MOCK_ORDER_DATA.totalQuantity} món):</span>
                            <span>{subTotal.toLocaleString('vi-VN')} đ</span>
                        </div>

                        {/* Nhập khuyến mãi */}
                        <DiscountApplier
                            orderTotal={subTotal}
                            appliedDiscount={appliedDiscount}
                            onApply={(discount) => setAppliedDiscount(discount)}
                            onRemove={() => setAppliedDiscount(null)}
                        />

                        {discountAmount > 0 && (
                            <div className="summary-row discount-row">
                                <span>Khuyến mãi:</span>
                                <span>- {discountAmount.toLocaleString('vi-VN')} đ</span>
                            </div>
                        )}

                        <div className="summary-row total-row">
                            <span>Khách cần trả:</span>
                            <span className="final-price">{finalTotal.toLocaleString('vi-VN')} đ</span>
                        </div>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="payment-methods">
                        <PaymentMethodSelector
                            selectedMethod={paymentMethod}
                            onSelect={setPaymentMethod}
                        />
                    </div>

                    {/* Các nút hành động */}
                    <div className="action-buttons">
                        <button className="btn-print-temp">
                            <Printer size={20} />
                            In tạm tính
                        </button>
                        <button className="btn-pay" onClick={handleCheckout}>
                            Hoàn tất thanh toán
                        </button>
                    </div>
                </div>
            </div>
            {showBillSummary && completedBillData && (
                <BillSummary
                    bill={completedBillData}
                    onClose={handleCloseBill}
                    onPrint={() => {
                        console.log('Kích hoạt máy in cho hóa đơn:', completedBillData.id);
                        window.print();
                    }}
                />
            )}
        </div>
    );
};

export default CheckOutView;