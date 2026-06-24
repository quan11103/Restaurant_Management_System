export class GoodsBillItemDto {
    ingredientSupplierId: number;
    price: number;
    quantity: number;
}

export class CreateGoodsBillDto {
    warehouseStaffId: number;
    items: GoodsBillItemDto[];
}