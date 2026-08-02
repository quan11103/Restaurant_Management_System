import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axios';
import Pagination from '../../../components/Pagination';
import MenuFilterBar from './MenuFilterBar';
import DishGrid from './DishGrid';
import CartSidebar from './CartSidebar';
import './MenuOrderingView.css';

export interface Dish {
    id: string; // Đồng bộ ID từ API về dạng chuỗi để dễ xử lý trên UI
    name: string;
    price: number;
    category: string;
    isAvailable: boolean;
    image?: string;
    rating?: number;
    reviewCount?: number;
}

export interface CartItem extends Dish {
    cartItemId: string;
    quantity: number;
    note: string;
}

interface OrderLocationState {
    tableId?: number;
    tableName?: string;
    orderId?: number | null;
}

const CATEGORY_OPTIONS = [
    { label: 'Tất cả danh mục', value: 'Tất cả' },
    { label: 'Món chính', value: 'Món chính' },
    { label: 'Pizza', value: 'Pizza' },
    { label: 'Burger', value: 'Burger' },
    { label: 'Gà rán', value: 'Gà rán' },
    { label: 'Ăn kèm', value: 'Ăn kèm' },
    { label: 'Salad', value: 'Salad' },
    { label: 'Khai vị', value: 'Khai vị' },
    { label: 'Đồ uống', value: 'Đồ uống' },
    { label: 'Cà phê', value: 'Cà phê' },
    { label: 'Nước ép', value: 'Nước ép' },
    { label: 'Sinh tố', value: 'Sinh tố' },
    { label: 'Tráng miệng', value: 'Tráng miệng' },
];

const MenuOrderingView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as OrderLocationState | null;

    const currentTableName = state?.tableName || 'Chưa chọn bàn';
    const currentTableId = state?.tableId;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');

    const [dishes, setDishes] = useState<Dish[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const itemsPerPage = 12;

    const topRef = useRef<HTMLDivElement>(null);

    // Tải danh sách món ăn từ API
    useEffect(() => {
        const fetchDishes = async () => {
            setIsLoading(true);

            try {
                const params: Record<string, any> = {
                    page: currentPage,
                    limit: itemsPerPage,
                };

                if (searchTerm.trim()) params.q = searchTerm.trim();
                if (selectedCategory !== 'Tất cả') params.type = selectedCategory;

                const response = await axiosClient.get('/dishes', { params });

                if (response.data) {
                    const rawList = response.data.data || (Array.isArray(response.data) ? response.data : []);

                    const mappedDishes: Dish[] = rawList.map((item: any) => {
                        const mainImage = item.images?.find((img: any) => img.isMain);
                        return {
                            id: item.id.toString(),
                            name: item.name,
                            price: item.price,
                            category: item.type ?? item.category,
                            isAvailable: item.isAvailable !== false,
                            image: mainImage?.imageUrl ?? item.images?.[0]?.imageUrl ?? "https://via.placeholder.com/300x200?text=No+Image",
                            rating: item.rating || 0,
                            reviewCount: item.reviewCount || 0,
                        };
                    });

                    setDishes(mappedDishes);
                    setTotalPages(response.data.pagination?.totalPages || 1);
                }
            } catch (error) {
                console.error('Lỗi khi tải danh sách món ăn:', error);
                setDishes([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchDishes, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedCategory, currentPage]);

    const handleSearchChange = (value: string) => { setSearchTerm(value); setCurrentPage(1); };
    const handleCategoryChange = (value: string) => { setSelectedCategory(value); setCurrentPage(1); };

    // --- LOGIC XỬ LÝ GIỎ HÀNG ---
    const handleAddToCart = (dish: Dish) => {
        if (!dish.isAvailable) return;

        setCart(prev => {
            const existingItem = prev.find(item => item.id === dish.id);
            if (existingItem) {
                return prev.map(item => item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...dish, cartItemId: Date.now().toString(), quantity: 1, note: '' }];
        });
    };

    const handleIncreaseQuantity = (cartItemId: string) => {
        setCart(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item));
    };

    const handleDecreaseQuantity = (cartItemId: string) => {
        setCart(prev => prev.map(item => item.cartItemId === cartItemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item));
    };

    const handleRemoveItem = (cartItemId: string) => {
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    // --- TÍCH HỢP API POST /orders/dine-in KHỚP VỚI CREATEORDERDTO MỚI ---
    const handleSubmitOrder = async () => {
        if (!currentTableId) {
            alert('Chưa xác định được bàn! Vui lòng quay lại sơ đồ bàn để chọn bàn trước.');
            return;
        }

        if (cart.length === 0) {
            alert('Giỏ hàng đang trống! Vui lòng chọn món trước khi gửi nhà bếp.');
            return;
        }

        // Tạo Payload chuẩn CreateOrderDto (Không gửi waiterId, Backend tự lấy từ JWT)
        const createOrderDto = {
            tableId: Number(currentTableId),
            items: cart.map(item => ({
                dishId: Number(item.id), // Chuyển id dạng string thành number
                quantity: item.quantity,
            })),
        };

        setIsSubmitting(true);

        try {
            const response = await axiosClient.post('/orders/dine-in', createOrderDto);

            if (response.data) {
                const message = response.data.message || 'Đã gửi món xuống nhà bếp thành công!';
                alert(`✅ ${message}`);

                setCart([]); // Reset giỏ hàng sau khi gửi thành công
            }
        } catch (error: any) {
            console.error('Lỗi khi gửi order:', error);

            const apiMessage = error.response?.data?.message;

            if (Array.isArray(apiMessage)) {
                alert(`❌ Vui lòng kiểm tra lại:\n- ${apiMessage.join('\n- ')}`);
            } else if (typeof apiMessage === 'string') {
                alert(`❌ Lỗi: ${apiMessage}`);
            } else {
                alert('❌ Lỗi kết nối đến máy chủ. Vui lòng thử lại!');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="ordering-view-layout">
            <div className="menu-section">
                <div className="menu-header">
                    <h2 ref={topRef}>Thực đơn gọi món - {currentTableName}</h2>
                    <MenuFilterBar
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                        searchPlaceholder="Tìm món ăn..."
                        selectedCategory={selectedCategory}
                        onCategoryChange={handleCategoryChange}
                        categoryOptions={CATEGORY_OPTIONS}
                    />
                </div>

                {isLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải thực đơn...</div>
                ) : (
                    <>
                        <DishGrid dishes={dishes} onDishClick={handleAddToCart} />

                        <div className="pagination-wrapper">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Component Giỏ hàng Sidebar */}
            <CartSidebar
                cartItems={cart}
                tableName={currentTableName}
                onIncrease={handleIncreaseQuantity}
                onDecrease={handleDecreaseQuantity}
                onRemove={handleRemoveItem}
                onSubmitOrder={handleSubmitOrder}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default MenuOrderingView;