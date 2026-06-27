import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import DataTable, { type Column } from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import { type SelectOption } from '../../../components/SelectBox';
import Badge from '../../../components/Badge';
import MenuFilterBar from '../../../components/MenuFilterBar';
import MenuForm, { type MenuFormData } from './MenuForm';
import './MenuManagementView.css';

interface MenuItem {
    id: string;
    name: string;
    category: string;
    price: number;
    status: 'Có thể gọi' | 'Tạm ngừng';
}

// Danh sách danh mục để dùng cho bộ lọc và form
const categoryOptions: SelectOption[] = [
    { label: 'Tất cả danh mục', value: 'Tất cả' },
    { label: 'Cà phê', value: 'Cà phê' },
    { label: 'Trà trái cây', value: 'Trà trái cây' },
    { label: 'Bánh ngọt', value: 'Bánh ngọt' },
];

// Dữ liệu giả lập ban đầu cho thực đơn của L'amande
const INITIAL_MENU: MenuItem[] = [
    { id: 'MA001', name: 'Bánh sừng bò (Croissant)', category: 'Bánh ngọt', price: 45000, status: 'Có thể gọi' },
    { id: 'MA002', name: 'Cà phê Latte đá', category: 'Cà phê', price: 55000, status: 'Có thể gọi' },
    { id: 'MA003', name: 'Trà đào cam sả', category: 'Trà trái cây', price: 50000, status: 'Có thể gọi' },
    { id: 'MA004', name: 'Bánh Tiramisu', category: 'Bánh ngọt', price: 65000, status: 'Tạm ngừng' },
    { id: 'MA005', name: 'Khoai tây chiên sốt phô mai', category: 'Món ăn nhẹ', price: 40000, status: 'Có thể gọi' },
];

const MenuManagementView: React.FC = () => {
    // Các States quản lý dữ liệu và bộ lọc
    const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');

    // Các States quản lý Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    // State quản lý toàn bộ dữ liệu Form
    const [formData, setFormData] = useState<MenuFormData>({
        name: '',
        category: 'Cà phê',
        price: '',
        status: 'Có thể gọi'
    });

    // Logic Tìm kiếm và Lọc dữ liệu
    const filteredMenuItems = useMemo(() => {
        return menuItems.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory =
                selectedCategory === 'Tất cả' || item.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory, menuItems]);

    // Xử lý mở đóng Form
    const handleOpenAddModal = () => {
        setEditingItem(null);
        setFormData({ name: '', category: 'Cà phê', price: '', status: 'Có thể gọi' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            price: item.price,
            status: item.status
        });
        setIsModalOpen(true);
    };

    const handleSaveItem = () => {
        if (!formData.name || !formData.price) {
            alert('Vui lòng nhập đầy đủ tên món và giá bán!');
            return;
        }

        if (editingItem) {
            setMenuItems(prev => prev.map(item => item.id === editingItem.id
                ? { ...item, ...formData, price: Number(formData.price) }
                : item
            ));
        } else {
            const newId = `MA${String(menuItems.length + 1).padStart(3, '0')}`;
            const newItem: MenuItem = {
                id: newId,
                ...formData,
                price: Number(formData.price)
            };
            setMenuItems(prev => [newItem, ...prev]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteItem = (id: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa món có mã ${id}?`)) {
            setMenuItems(prev => prev.filter(item => item.id !== id));
        }
    };

    // Cấu hình các cột cho DataTable
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
            key: 'status',
            title: 'Trạng thái',
            render: (item) => (
                <Badge
                    variant={item.status === 'Có thể gọi' ? 'success' : 'danger'}
                >
                    {item.status}
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

            {/* Tiêu đề góc trên */}
            <div className="view-header">
                <div>
                    <h1 className="view-title">Quản Lý Thực Đơn</h1>
                    <p className="view-subtitle">Danh mục các món ăn và thức uống phục vụ tại cửa hàng</p>
                </div>
                <button className="btn-add-new" onClick={handleOpenAddModal}>
                    <Plus size={18} /> Thêm món mới
                </button>
            </div>

            {/* Thanh công cụ: tìm kiếm & bộ lọc */}
            <MenuFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categoryOptions={categoryOptions}
            />

            {/* Bảng dữ liệu chính */}
            <div className="view-content">
                <DataTable columns={columns} data={filteredMenuItems} emptyMessage="Không tìm thấy món ăn nào khớp với bộ lọc" />
            </div>

            {/* Modal */}
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