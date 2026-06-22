export class OrderItemDto {
    dishId: number;
    quantity: number;
    price: number;
}

export class CreateOrderDto {
    waiterId: number;
    tableId: number;
    items: OrderItemDto[];
}