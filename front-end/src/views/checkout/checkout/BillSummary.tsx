import React from 'react';
import { Printer, CheckCircle2 } from 'lucide-react';
import './BillSummary.css';

// =======================================================
// INTERFACES: Ánh xạ kết quả query từ Prisma
// Prisma query mẫu: 
// prisma.bill.findUnique({ include: { order: { include: { orderedDishes: { include: { dish: true } } } }, cashier: true, promotion: true } })
// =======================================================
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
    bill: BillModel;
    onClose?: () => void;
    onPrint?: () => void;
}

const BillSummary: React.FC<BillSummaryProps> = ({ bill, onClose, onPrint }) => {
    // Hàm dịch phương thức thanh toán sang tiếng Việt
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
        <div className="bill-summary-overlay" onClick={onClose}>
            <div className="bill-summary-overlay">
                <div className="bill-summary-container" onClick={(e) => e.stopPropagation()}>

                    {/* Phần Header Báo thành công (Có thể ẩn nếu chỉ xem lại lịch sử) */}
                    <div className="bill-summary-body">
                        <div className="bill-success-header">
                            <CheckCircle2 size={48} className="success-icon" />
                            <h3>Thanh toán thành công</h3>
                        </div>

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
        </div>
    );
};

export default BillSummary;