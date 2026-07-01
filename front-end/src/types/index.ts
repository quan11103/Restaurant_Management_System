export interface Product {
    id: string | number;
    name: string;
    imageUrl: string;
    rating?: number;
    totalReviews?: number;
    price: number;
    originalPrice?: number;
    distance?: number;
    deliveryTime?: string;
    isPromo?: boolean;
}