export class ConfirmCheckoutDto {
    orderTableId: number;
    orderId: number;
    tableId: number;
    cashierId: number;
    paymentMethod: string;
    promotionId?: number;
    discountAmount: number;
    finalTotal: number;
}