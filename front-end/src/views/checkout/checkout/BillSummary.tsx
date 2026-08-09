import React, { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import './BillSummary.css';

export interface BillModel {
    id: number;
    orderId: number;
    paymentTime: string;
    paymentMethod: string;
    discount: number;
    total: number;

    cashier?: { fullName: string } | null;
    promotion?: { code: string; value: number; type: string } | null;
    order: {
        totalQuantity: number;
        orderedDishes: {
            id: number;
            quantity: number;
            price: number;
            subTotal: number;
            dish: { name: string };
        }[];
    };
}

interface BillSummaryProps {
    isOpen?: boolean; // Thêm prop isOpen để điều khiển đóng/mở
    bill: BillModel;
    onClose?: () => void;
    onPrint?: () => void;
}

const BillSummary: React.FC<BillSummaryProps> = ({
    isOpen = true,
    bill,
    onClose,
    onPrint
}) => {
    const [isRendered, setIsRendered] = useState(isOpen);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        if (isClosing) return;
        setIsClosing(true);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300);
    };

    useEffect(() => {
        if (isOpen) {
            // Khi mở: Render ngay lập tức và khóa cuộn nền
            setIsRendered(true);
            setIsClosing(false);
            document.body.style.overflow = 'hidden';
        } else {
            // Khi đóng: Bật cờ isClosing để chạy CSS animation
            setIsClosing(true);
            document.body.style.overflow = 'unset';

            // Hẹn giờ 300ms (bằng thời gian animation đóng) rồi mới gỡ component
            const timer = setTimeout(() => {
                setIsRendered(false);
                setIsClosing(false);
            }, 300);

            return () => clearTimeout(timer);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isRendered]);

    if (!isRendered) return null;

    const getPaymentMethodText = (method: string) => {
        switch (method) {
            case 'CASH': return 'Tiền mặt';
            case 'TRANSFER': return 'Chuyển khoản';
            case 'CARD': return 'Quẹt thẻ';
            default: return method;
        }
    };

    const subTotal = bill.total + bill.discount;

    return (
        <div
            className={`bill-summary-overlay ${isClosing ? 'closing' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`bill-summary-container ${isClosing ? 'closing' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bill-summary-body">

                    {/* PHẦN BIÊN LAI (RECEIPT FORMAT) */}
                    <div className="receipt-paper">
                        <div className="receipt-header">
                            <h2>NHÀ HÀNG HÒA HẢO</h2>
                            <p>123 Đường ABC, Quận XYZ, TP. Hà Nội</p>
                            <p>SĐT: 098 765 4321</p>
                            <div className="divider-dashed"></div>
                            <h3>HÓA ĐƠN THANH TOÁN</h3>
                        </div>

                        <div className="receipt-meta">
                            <div className="meta-row"><span>Số HĐ:</span> <span>#{bill.id}</span></div>
                            <div className="meta-row"><span>Mã ĐH:</span> <span>#{bill.orderId}</span></div>
                            <div className="meta-row"><span>Thời gian:</span> <span>{new Date(bill.paymentTime).toLocaleString('vi-VN')}</span></div>
                            <div className="meta-row"><span>Thu ngân:</span> <span>{bill.cashier?.fullName || 'N/A'}</span></div>
                            <div className="meta-row"><span>PT Thanh toán:</span> <span>{getPaymentMethodText(bill.paymentMethod)}</span></div>
                        </div>

                        <div className="divider-dashed"></div>

                        <div className="receipt-items">
                            <div className="item-header">
                                <span className="name">Tên món</span>
                                <span className="qty">SL</span>
                                <span className="total">Thành tiền</span>
                            </div>

                            {bill.order.orderedDishes.map((item) => (
                                <div key={item.id} className="item-row">
                                    <span className="name">{item.dish.name}</span>
                                    <span className="qty">{item.quantity}</span>
                                    <span className="total">{item.subTotal.toLocaleString('vi-VN')}</span>
                                </div>
                            ))}
                        </div>

                        <div className="divider-dashed"></div>

                        <div className="receipt-summary">
                            <div className="summary-row">
                                <span>Cộng tiền hàng:</span>
                                <span>{subTotal.toLocaleString('vi-VN')} đ</span>
                            </div>

                            {bill.discount > 0 && (
                                <div className="summary-row discount">
                                    <span>Khuyến mãi {bill.promotion?.code ? `(${bill.promotion.code})` : ''}:</span>
                                    <span>- {bill.discount.toLocaleString('vi-VN')} đ</span>
                                </div>
                            )}

                            <div className="summary-row final-total">
                                <span>TỔNG THANH TOÁN:</span>
                                <span>{bill.total.toLocaleString('vi-VN')} đ</span>
                            </div>
                        </div>

                        <div className="divider-dashed"></div>

                        <div className="receipt-footer">
                            <p>Cảm ơn quý khách và hẹn gặp lại!</p>
                            <p>Powered by React POS</p>
                        </div>
                    </div>
                </div>

                {/* Các nút hành động */}
                <div className="bill-actions">
                    <button className="btn-print-bill" onClick={onPrint || (() => window.print())}>
                        <Printer size={20} />
                        In hóa đơn
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillSummary;