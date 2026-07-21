import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAlert } from '../../../components/Alert';
import { type SelectOption } from '../../../components/SelectBox';
import DataTable, { type Column } from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import Badge from '../../../components/Badge';
import ConfirmModal from '../../../components/ConfirmModal';
import Pagination from '../../../components/Pagination';
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

const MenuManagementView: React.FC = () => {
    const { showAlert } = useAlert();

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [formData, setFormData] = useState<MenuFormData>({
        name: '',
        category: 'Món chính',
        price: '',
        isAvailable: 'Có thể gọi',
        description: '',
        images: [],
    });

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchDishes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory, currentPage, searchTerm]);

    const fetchDishes = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get('/dishes', {
                params: {
                    search: searchTerm,
                    type: selectedCategory !== 'Tất cả' ? selectedCategory : undefined,
                    page: currentPage,
                    limit: itemsPerPage,
                },
            });

            if (response.data) {
                // Xử lý linh hoạt cấu trúc trả về từ backend
                const rawData = Array.isArray(response.data)
                    ? response.data
                    : response.data.data || response.data.dishes || response.data.items || [];

                const formattedData: MenuItem[] = rawData.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    category: item.type,
                    price: item.price,
                    isAvailable: item.isAvailable !== false ? 'Có thể gọi' : 'Tạm ngừng',
                    description: item.description || '',
                    images: item.images || [],
                }));

                setMenuItems(formattedData);

                if (response.data.pagination) {
                    setCurrentPage(response.data.pagination.currentPage || currentPage);
                    setTotalPages(response.data.pagination.totalPages || 1);
                } else {
                    setTotalPages(response.data.totalPages || 1);
                }
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

    const handleOpenAddModal = () => {
        setEditingItem(null);
        setFormData({ name: '', category: 'Món chính', price: '', isAvailable: 'Có thể gọi', description: '', images: [] });
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

    const handleOpenDeleteModal = (id: string) => {
        setDeleteItemId(id);
        setIsDeleteModalOpen(true);
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
        const url = isEditMode ? `/dishes/${editingItem.id}` : '/dishes';
        const method = isEditMode ? 'patch' : 'post';

        try {
            const response = await axiosClient(url, {
                method: method,
                data: payload
            });

            if (response.data) {
                showAlert(
                    'success',
                    isEditMode ? 'Cập nhật thông tin món ăn thành công!' : 'Đã thêm món ăn mới vào thực đơn',
                    'Thành công'
                );
                setIsModalOpen(false);
                setEditingItem(null);
                fetchDishes();
            } else {
                showAlert(
                    'error',
                    response.data.message || (isEditMode ? 'Không thể cập nhật món ăn' : 'Không thể tạo món ăn'),
                    'Lỗi hệ thống'
                );
            }
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            showAlert('error', 'Đã xảy ra lỗi kết nối với máy chủ!', 'Lỗi hệ thống');
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!id) {
            showAlert('error', 'Không tìm thấy ID món ăn để tiến hành xóa!', 'Lỗi dữ liệu');
            return;
        }

        try {
            const response = await axiosClient.delete(`/dishes/${id}`);

            if (response.data) {
                showAlert('success', 'Đã xóa món ăn khỏi thực đơn!', 'Thành công');
                fetchDishes();
            } else {
                showAlert('error', response.data.message || 'Không thể xóa món ăn này', 'Lỗi hệ thống');
            }
        } catch (error) {
            console.error('Lỗi khi gọi API xóa:', error);
            showAlert('error', 'Đã xảy ra lỗi kết nối với máy chủ!', 'Lỗi hệ thống');
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
                    <button className="btn-action delete" onClick={() => handleOpenDeleteModal(item.id)} title="Xóa">
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
                onSearchChange={(val) => {
                    setSearchTerm(val);
                    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                }}
                selectedCategory={selectedCategory}
                onCategoryChange={(val) => {
                    setSelectedCategory(val);
                    setCurrentPage(1); // Reset về trang 1 khi lọc danh mục
                }}
                categoryOptions={categoryOptions}
            />

            <div className="view-content">
                <DataTable
                    columns={columns}
                    data={menuItems}
                    emptyMessage={isLoading ? 'Đang tải dữ liệu...' : 'Không tìm thấy món ăn nào khớp với bộ lọc'}
                />

                <div className="pagination-wrapper">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                }}
                title={editingItem ? 'Cập Nhật Món Ăn' : 'Thêm Món Ăn Mới'}
                footer={
                    <>
                        <button className="btn-form-cancel" onClick={() => { setIsModalOpen(false); setEditingItem(null); }}>
                            Hủy bỏ
                        </button>
                        <button className="btn-form-submit" onClick={handleSaveItem}>
                            Lưu thông tin
                        </button>
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

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Xác nhận xóa món ăn"
                message={`Bạn có chắc chắn muốn xóa món này?`}
                confirmLabel="Xác nhận xóa"
                cancelLabel="Hủy bỏ"
                onConfirm={async () => {
                    const idToDelete = deleteItemId || '';
                    setIsDeleteModalOpen(false);
                    await handleDeleteItem(idToDelete);
                    setDeleteItemId(null);
                }}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteItemId(null);
                }}
            />
        </div>
    );
};

export default MenuManagementView;