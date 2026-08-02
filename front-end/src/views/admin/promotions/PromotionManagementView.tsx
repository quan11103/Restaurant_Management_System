import React, { useState, useMemo, useEffect } from 'react';
import axiosClient from '../../../api/axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAlert } from '../../../components/Alert';
import DataTable, { type Column } from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import Badge from '../../../components/Badge';
import ConfirmModal from '../../../components/ConfirmModal';
import PromotionForm, { type PromotionFormData } from './PromotionForm';
import './PromotionManagementView.css';

interface PromotionItem {
    id: number;
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number;
    description: string;
    startDate: string;
    endDate: string;
    minOrderValue: number | null;
    maxDiscount: number | null;
    usageLimit: number | null;
    usedCount: number;
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const getPromotionStatus = (item: PromotionItem) => {
    const now = new Date();
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);

    if (now < start) {
        return { text: 'Chưa bắt đầu', variant: 'warning' as const };
    }
    if (now > end) {
        return { text: 'Đã hết hạn', variant: 'danger' as const };
    }
    if (item.usageLimit && item.usedCount >= item.usageLimit) {
        return { text: 'Hết lượt dùng', variant: 'info' as const };
    }
    return { text: 'Đang diễn ra', variant: 'success' as const };
};

const PromotionManagementView: React.FC = () => {
    const { showAlert } = useAlert();

    const [promotions, setPromotions] = useState<PromotionItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PromotionItem | null>(null);
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

    const [formData, setFormData] = useState<PromotionFormData>({
        code: '',
        type: 'PERCENTAGE',
        value: '',
        description: '',
        startDate: '',
        endDate: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
    });

    const fetchPromotions = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get('/promotions');
            if (response.data) {
                setPromotions(response.data);
            } else {
                showAlert('error', 'Không thể tải dữ liệu khuyến mãi', 'Lỗi');
            }
        } catch (error: any) {
            console.error('Lỗi khi fetch promotions:', error);
            showAlert('error', 'Đã xảy ra lỗi kết nối với máy chủ!', 'Lỗi hệ thống');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const filteredPromotions = useMemo(() => {
        return promotions.filter((item) => {
            const matchesSearch = item.code.toLowerCase().includes(searchTerm.toLowerCase());

            if (statusFilter === 'ALL') return matchesSearch;

            const status = getPromotionStatus(item);
            let matchesStatus = false;
            if (statusFilter === 'ACTIVE' && status.text === 'Đang diễn ra') matchesStatus = true;
            if (statusFilter === 'UPCOMING' && status.text === 'Chưa bắt đầu') matchesStatus = true;
            if (statusFilter === 'EXPIRED' && (status.text === 'Đã hết hạn' || status.text === 'Hết lượt dùng')) matchesStatus = true;

            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, promotions]);

    const handleOpenAddModal = () => {
        setEditingItem(null);

        // Mặc định ngày bắt đầu là hôm nay, ngày kết thúc là 7 ngày sau
        const today = new Date();
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        setFormData({
            code: '',
            type: 'PERCENTAGE',
            value: '',
            description: '',
            startDate: today.toISOString().split('T')[0],
            endDate: nextWeek.toISOString().split('T')[0],
            minOrderValue: '',
            maxDiscount: '',
            usageLimit: '',
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: PromotionItem) => {
        setEditingItem(item);
        setFormData({
            code: item.code,
            type: item.type,
            value: item.value,
            description: item.description || '',
            startDate: item.startDate ? item.startDate.split('T')[0] : '',
            endDate: item.endDate ? item.endDate.split('T')[0] : '',
            minOrderValue: item.minOrderValue !== null ? item.minOrderValue : '',
            maxDiscount: item.maxDiscount !== null ? item.maxDiscount : '',
            usageLimit: item.usageLimit !== null ? item.usageLimit : '',
        });
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (id: number) => {
        setDeleteItemId(id);
        setIsDeleteModalOpen(true);
    };

    const handleSaveItem = async () => {
        if (!formData.code.trim()) {
            showAlert('error', 'Vui lòng nhập mã khuyến mãi!', 'Lỗi nhập liệu');
            return;
        }
        if (!formData.value) {
            showAlert('error', 'Vui lòng nhập giá trị khuyến mãi!', 'Lỗi nhập liệu');
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            showAlert('error', 'Vui lòng chọn ngày bắt đầu và kết thúc!', 'Lỗi nhập liệu');
            return;
        }
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            showAlert('error', 'Ngày bắt đầu phải trước ngày kết thúc!', 'Lỗi nhập liệu');
            return;
        }

        const payload = {
            code: formData.code.trim().toUpperCase(),
            type: formData.type,
            value: Number(formData.value),
            description: formData.description.trim() || null,
            startDate: new Date(formData.startDate + 'T00:00:00.000Z').toISOString(),
            endDate: new Date(formData.endDate + 'T23:59:59.000Z').toISOString(),
            minOrderValue: formData.minOrderValue !== '' ? Number(formData.minOrderValue) : null,
            maxDiscount: formData.type === 'PERCENTAGE' && formData.maxDiscount !== '' ? Number(formData.maxDiscount) : null,
            usageLimit: formData.usageLimit !== '' ? Number(formData.usageLimit) : null,
        };

        const isEditMode = !!editingItem;
        const url = isEditMode
            ? `/promotions/${editingItem.id}`
            : '/promotions';
        const method = isEditMode ? 'patch' : 'post';

        try {
            const response = await axiosClient(url, {
                method: method,
                data: payload
            });

            if (response.data) {
                showAlert(
                    'success',
                    isEditMode ? 'Cập nhật khuyến mãi thành công!' : 'Đã tạo chương trình khuyến mãi mới!',
                    'Thành công'
                );
                setIsModalOpen(false);
                setEditingItem(null);
                fetchPromotions();
            }
        } catch (error: any) {
            console.error('Lỗi khi gọi API lưu khuyến mãi:', error);
            const errorMsg = error.response?.data?.message || 'Đã xảy ra lỗi kết nối với máy chủ!';
            showAlert('error', Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg, 'Lỗi hệ thống');
        }
    };

    const handleDeleteItem = async (id: number) => {
        try {
            const response = await axiosClient.delete(`/promotions/${id}`);
            if (response.data) {
                showAlert('success', 'Đã xóa chương trình khuyến mãi thành công!', 'Thành công');
                fetchPromotions();
            }
        } catch (error: any) {
            console.error('Lỗi khi xóa khuyến mãi:', error);
            const errorMsg = error.response?.data?.message || 'Không thể xóa khuyến mãi này!';
            showAlert('error', errorMsg, 'Lỗi hệ thống');
        }
    };

    const columns: Column<PromotionItem>[] = [
        {
            key: 'code',
            title: 'Mã',
            render: (item) => <strong className="promo-code">{item.code}</strong>
        },
        {
            key: 'type',
            title: 'Loại giảm',
            render: (item) => (
                <Badge variant={item.type === 'PERCENTAGE' ? 'primary' : 'info'}>
                    {item.type === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Cố định (VNĐ)'}
                </Badge>
            )
        },
        {
            key: 'value',
            title: 'Giá trị giảm',
            render: (item) => (
                <span className="promo-value">
                    {item.type === 'PERCENTAGE'
                        ? `${item.value}%`
                        : `${item.value.toLocaleString('vi-VN')} đ`}
                </span>
            )
        },
        {
            key: 'dateRange',
            title: 'Hạn dùng',
            render: (item) => (
                <span className="promo-dates">
                    {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </span>
            )
        },
        {
            key: 'minOrderValue',
            title: 'Đơn hàng tối thiểu',
            render: (item) => (
                <span>
                    {item.minOrderValue !== null && item.minOrderValue !== undefined
                        ? `${item.minOrderValue.toLocaleString('vi-VN')} đ`
                        : 'Không yêu cầu'}
                </span>
            )
        },
        {
            key: 'usage',
            title: 'Lượt đã dùng',
            render: (item) => (
                <span className="promo-usage">
                    <strong>{item.usedCount}</strong> / {item.usageLimit !== null ? item.usageLimit : '∞'}
                </span>
            )
        },
        {
            key: 'status',
            title: 'Trạng thái',
            render: (item) => {
                const status = getPromotionStatus(item);
                return (
                    <Badge variant={status.variant}>
                        {status.text}
                    </Badge>
                );
            }
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
        <div className="promotion-management-view">
            <div className="view-header">
                <div>
                    <h1 className="view-title">Quản Lý Khuyến Mãi</h1>
                    <p className="view-subtitle">Tạo và cấu hình các chương trình giảm giá cho khách hàng</p>
                </div>
                <button className="btn-add-new" onClick={handleOpenAddModal}>
                    <Plus size={18} /> Thêm mã mới
                </button>
            </div>

            <div className="promotions-filter-bar">
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã khuyến mãi..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-wrapper">
                    <span className="filter-label">Trạng thái:</span>
                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Tất cả</option>
                        <option value="ACTIVE">Đang diễn ra</option>
                        <option value="UPCOMING">Chưa diễn ra</option>
                        <option value="EXPIRED">Đã hết hạn / Hết lượt</option>
                    </select>
                </div>
            </div>

            <div className="view-content">
                <DataTable
                    columns={columns}
                    data={filteredPromotions}
                    emptyMessage={isLoading ? "Đang tải dữ liệu..." : "Không tìm thấy chương trình khuyến mãi nào"}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                }}
                title={editingItem ? 'Cập Nhật Khuyến Mãi' : 'Tạo Khuyến Mãi Mới'}
                footer={
                    <>
                        <button className="btn-form-cancel" onClick={() => { setIsModalOpen(false); setEditingItem(null); }}>Hủy bỏ</button>
                        <button className="btn-form-submit" onClick={handleSaveItem}>Lưu thông tin</button>
                    </>
                }
                maxWidth="650px"
            >
                <PromotionForm
                    formData={formData}
                    onChange={setFormData}
                />
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Xác nhận xóa khuyến mãi"
                message={`Bạn có chắc chắn muốn xóa mã khuyến mãi này? Thao tác này không thể hoàn tác.`}
                confirmLabel="Xác nhận xóa"
                cancelLabel="Hủy bỏ"
                onConfirm={async () => {
                    const idToDelete = deleteItemId;
                    setIsDeleteModalOpen(false);
                    if (idToDelete !== null) {
                        await handleDeleteItem(idToDelete);
                    }
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

export default PromotionManagementView;
