import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAlert } from '../../../components/Alert';
import DataTable, { type Column } from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import { type SelectOption } from '../../../components/SelectBox';
import Badge from '../../../components/Badge';
import MenuFilterBar from './MenuFilterBar';
import MenuForm, { type DishImageInput, type MenuFormData } from './MenuForm';
import './MenuManagementView.css';

interface MenuItem {
    id: string;
    name: string;
    category: string;
    price: number;
    isAvailable: 'Có thể gọi' | 'Tạm ngừng';
    description: string;
    images: DishImageInput[];
}

const categoryOptions: SelectOption[] = [
    { label: 'Tất cả danh mục', value: 'Tất cả' },
    { label: 'Đồ ăn nhanh', value: 'Đồ ăn nhanh' },
    { label: 'Trà sữa', value: 'Trà sữa' },
    { label: 'Cơm văn phòng', value: 'Cơm văn phòng' },
    { label: 'Đồ ăn vặt', value: 'Đồ ăn vặt' },
    { label: 'Món tráng miệng', value: 'Món tráng miệng' },
    { label: 'Đồ chay', value: 'Đồ chay' },
];

const MenuManagementView: React.FC = () => {
    const { showAlert } = useAlert();

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState<MenuFormData>({
        name: '',
        category: 'Cà phê',
        price: '',
        isAvailable: 'Có thể gọi',
        description: '',
        images: [],
    });

    const fetchDishes = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:3000/dishes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                const formattedData: MenuItem[] = data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    category: item.type,
                    price: item.price,
                    isAvailable: item.isAvailable !== false ? 'Có thể gọi' : 'Tạm ngừng',
                    description: item.description || '',
                    images: item.images || []
                }));

                setMenuItems(formattedData);
            } else {
                showAlert('error', 'Không thể tải dữ liệu thực đơn', 'Lỗi');
            }
        } catch (error) {
            console.error('Lỗi khi fetch data:', error);
            showAlert('error', 'Đã xảy ra lỗi kết nối với máy chủ!', 'Lỗi hệ thống');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDishes();
    }, []);

    const filteredMenuItems = useMemo(() => {
        return menuItems.filter((item) => {
            const idString = String(item.id || '');
            const matchesSearch =
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                idString.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory =
                selectedCategory === 'Tất cả' || item.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory, menuItems]);

    const handleOpenAddModal = () => {
        setEditingItem(null);
        setFormData({ name: '', category: 'Đồ ăn nhanh', price: '', isAvailable: 'Có thể gọi', description: '', images: [] });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            price: item.price,
            isAvailable: item.isAvailable,
            description: item.description || '',
            images: item.images || []
        });
        setIsModalOpen(true);
    };

    const handleSaveItem = async () => {
        if (!formData.name.trim() || !formData.price) {
            alert('Vui lòng nhập tên và giá món ăn!');
            return;
        }

        const payload = {
            name: formData.name,
            type: formData.category,
            price: Number(formData.price),
            description: formData.description,
            images: formData.images,
            isAvailable: formData.isAvailable === 'Có thể gọi',
        };

        const isEditMode = !!editingItem;
        const url = isEditMode
            ? `http://localhost:3000/dishes/${editingItem.id}`
            : 'http://localhost:3000/dishes';
        const method = isEditMode ? 'PATCH' : 'POST';

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showAlert(
                    'success',
                    isEditMode ? 'Cập nhật thông tin món ăn thành công!' : 'Đã thêm món ăn mới vào thực đơn',
                    'Thành công'
                );
                setIsModalOpen(false);
                fetchDishes();
            } else {
                const errorData = await response.json();
                showAlert(
                    'error',
                    errorData.message || (isEditMode ? 'Không thể cập nhật món ăn' : 'Không thể tạo món ăn'),
                    'Lỗi hệ thống'
                );
            }
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            showAlert('error', 'Đã xảy ra lỗi kết nối với máy chủ!', 'Lỗi hệ thống');
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa món có mã ${id}?`)) {
            try {
                const token = localStorage.getItem('access_token');

                const response = await fetch(`http://localhost:3000/dishes/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    showAlert('success', 'Đã xóa món ăn khỏi thực đơn!', 'Thành công');
                    fetchDishes();
                } else {
                    const errorData = await response.json();
                    showAlert('error', errorData.message || 'Không thể xóa món ăn này', 'Lỗi hệ thống');
                }
            } catch (error) {
                console.error('Lỗi khi gọi API xóa:', error);
                showAlert('error', 'Đã xảy ra lỗi kết nối với máy chủ!', 'Lỗi hệ thống');
            }
        }
    };

    const columns: Column<MenuItem>[] = [
        { key: 'id', title: 'Mã món' },
        { key: 'name', title: 'Tên món ăn / đồ uống' },
        { key: 'category', title: 'Danh mục' },
        {
            key: 'price',
            title: 'Giá bán',
            render: (item) => <strong className="price-text">{item.price.toLocaleString('vi-VN')} đ</strong>
        },
        {
            key: 'isAvailable',
            title: 'Trạng thái',
            render: (item) => (
                <Badge variant={item.isAvailable === 'Có thể gọi' ? 'success' : 'danger'}>
                    {item.isAvailable}
                </Badge>
            )
        },
        {
            key: 'actions',
            title: 'Thao tác',
            render: (item) => (
                <div className="action-buttons">
                    <button className="btn-action edit" onClick={() => handleOpenEditModal(item)} title="Sửa">
                        <Edit size={16} />
                    </button>
                    <button className="btn-action delete" onClick={() => handleDeleteItem(item.id)} title="Xóa">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="menu-management-view">
            <div className="view-header">
                <div>
                    <h1 className="view-title">Quản Lý Thực Đơn</h1>
                    <p className="view-subtitle">Danh mục các món ăn và thức uống phục vụ tại cửa hàng</p>
                </div>
                <button className="btn-add-new" onClick={handleOpenAddModal}>
                    <Plus size={18} /> Thêm món mới
                </button>
            </div>

            <MenuFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categoryOptions={categoryOptions}
            />

            <div className="view-content">
                <DataTable
                    columns={columns}
                    data={filteredMenuItems}
                    emptyMessage={isLoading ? "Đang tải dữ liệu..." : "Không tìm thấy món ăn nào khớp với bộ lọc"}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Cập Nhật Món Ăn' : 'Thêm Món Ăn Mới'}
                footer={
                    <>
                        <button className="btn-form-cancel" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                        <button className="btn-form-submit" onClick={handleSaveItem}>Lưu thông tin</button>
                    </>
                }
                maxWidth="550px"
            >
                <MenuForm
                    formData={formData}
                    onChange={setFormData}
                    categoryOptions={categoryOptions}
                />
            </Modal>
        </div>
    );
};

export default MenuManagementView;