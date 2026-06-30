export interface Product {
    id: string | number;
    name: string;
    imageUrl: string;
    rating?: number;
    totalReviews?: number;
    price: number;
    originalPrice?: number; // Dành cho món có giảm giá
    distance?: number; // Khoảng cách (km)
    deliveryTime?: string; // Ví dụ: "15-20 phút"
    isPromo?: boolean;
}