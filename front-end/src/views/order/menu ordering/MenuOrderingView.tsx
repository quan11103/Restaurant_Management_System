import React, { useState } from 'react';
import MenuFilterBar from '../../../components/MenuFilterBar';
import DishGrid from './DishGrid';
import CartSidebar from './CartSidebar';
import './MenuOrderingView.css';

export interface Dish {
    id: number;
    name: string;
    price: number;
    category: string;
    isAvailable: boolean;
    image?: string;
}

export interface CartItem extends Dish {
    cartItemId: string;
    quantity: number;
    note: string;
}

const MOCK_DISHES: Dish[] = [
    {
        id: 1,
        name: 'Cà phê đen đá',
        price: 25000,
        category: 'Cà phê',
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80'
    },
    {
        id: 2,
        name: 'Bạc xỉu',
        price: 30000,
        category: 'Cà phê',
        isAvailable: true,
        image: 'https://images.pexels.com/photos/2615323/pexels-photo-2615323.jpeg?auto=compress&cs=tinysrgb&w=500'
    },
    {
        id: 3,
        name: 'Trà đào cam sả',
        price: 45000,
        category: 'Trà trái cây',
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&q=80'
    },
    {
        id: 4,
        name: 'Sinh tố bơ',
        price: 50000,
        category: 'Sinh tố',
        isAvailable: false,
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80'
    },
    {
        id: 5,
        name: 'Bánh croissant',
        price: 35000,
        category: 'Bánh ngọt',
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80'
    },
];

const CATEGORY_OPTIONS = [
    { value: 'Tất cả', label: 'Tất cả danh mục' },
    { value: 'Cà phê', label: 'Cà phê' },
    { value: 'Trà trái cây', label: 'Trà trái cây' },
    { value: 'Sinh tố', label: 'Sinh tố' },
    { value: 'Bánh ngọt', label: 'Bánh ngọt' },
];

const MenuOrderingView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [cart, setCart] = useState<CartItem[]>([]);

    // Hàm xử lý logic cơ bản (sẽ tách ra custom hook sau nếu cần)
    const handleAddToCart = (dish: Dish) => {
        if (!dish.isAvailable) return;

        setCart(prev => {
            const existingItem = prev.find(item => item.id === dish.id);
            if (existingItem) {
                return prev.map(item =>
                    item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...dish, cartItemId: Date.now().toString(), quantity: 1, note: '' }];
        });
    };

    const handleIncreaseQuantity = (cartItemId: string) => {
        setCart(prev => prev.map(item =>
            item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        ));
    };

    const handleDecreaseQuantity = (cartItemId: string) => {
        setCart(prev => prev.map(item =>
            item.cartItemId === cartItemId && item.quantity > 1
                ? { ...item, quantity: item.quantity - 1 }
                : item
        ));
    };

    const handleRemoveItem = (cartItemId: string) => {
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const handleSubmitOrder = () => {
        // Logic gọi API gửi dữ liệu xuống Prisma Backend tại đây
        console.log("Đã gửi đơn hàng xuống bếp:", cart);
        alert("Đã gửi yêu cầu gọi món xuống nhà bếp thành công!");
        setCart([]); // Xóa giỏ hàng sau khi gửi thành công
    };

    const filteredDishes = MOCK_DISHES.filter(dish => {
        const matchName = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === 'Tất cả' || dish.category === selectedCategory;
        return matchName && matchCategory;
    });

    return (
        <div className="ordering-view-layout">

            {/* Cột trái: khu vực chọn món */}
            <div className="menu-section">
                <div className="menu-header">
                    <h2>Thực đơn gọi món</h2>
                    <MenuFilterBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Tìm món ăn..."
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        categoryOptions={CATEGORY_OPTIONS}
                    />
                </div>

                <DishGrid dishes={filteredDishes} onDishClick={handleAddToCart} />
            </div>

            {/* Cột phải: khu vực giỏ hàng */}
            <CartSidebar
                cartItems={cart}
                tableName="Bàn 05" // Giá trị này sau này sẽ lấy động từ TableMapView chuyển qua
                onIncrease={handleIncreaseQuantity}
                onDecrease={handleDecreaseQuantity}
                onRemove={handleRemoveItem}
                onSubmitOrder={handleSubmitOrder}
            />

        </div>
    );
};

export default MenuOrderingView;