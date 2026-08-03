import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axios';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { useAlert } from '../../../components/Alert';
import { type SelectOption } from '../../../components/SelectBox';
import DataTable, { type Column } from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import Badge from '../../../components/Badge';
import ConfirmModal from '../../../components/ConfirmModal';
import Pagination from '../../../components/Pagination';
import StaffFilterBar from './StaffFilterBar';
import StaffForm, { type StaffFormData } from './StaffForm';
import './StaffManagementView.css';

export interface StaffItem {
    id: number | string;
    username: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
}

const roleOptions: SelectOption[] = [
    { label: 'Tất cả nhân sự', value: 'Tất cả' },
    { label: 'Quản lý (Manager)', value: 'MANAGER' },
    { label: 'Thu ngân (Cashier)', value: 'CASHIER' },
    { label: 'Phục vụ (Waiter)', value: 'WAITER' },
];

const StaffManagementView: React.FC = () => {
    const { showAlert } = useAlert();

    const [staffList, setStaffList] = useState<StaffItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('Tất cả');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StaffItem | null>(null);
    const [deleteItemId, setDeleteItemId] = useState<string | number | null>(null);

    const [formData, setFormData] = useState<StaffFormData>({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        role: 'WAITER',
    });

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchStaff();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRole, currentPage, searchTerm]);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get('/users', {
                params: {
                    search: searchTerm,
                    role: selectedRole !== 'Tất cả' ? selectedRole : undefined,
                    page: currentPage,
                    limit: itemsPerPage,
                },
            });

            if (response.data) {
                const rawData = response.data.data;

                // Lọc bỏ tài khoản CLIENT ở frontend (để chắc chắn nếu backend trả nhầm)
                const filteredData = rawData.filter((item: any) => item.role !== 'CLIENT');

                const formattedData: StaffItem[] = filteredData.map((item: any) => ({
                    id: item.id,
                    username: item.username,
                    fullName: item.fullName || '',
                    email: item.email || '',
                    phone: item.phone || '',
                    role: item.role,
                    isActive: item.isActive !== false,
                }));

                setStaffList(formattedData);

                if (response.data.pagination) {
                    setCurrentPage(response.data.pagination.currentPage || currentPage);
                    setTotalPages(response.data.pagination.totalPages || 1);
                } else {
                    setTotalPages(response.data.totalPages || 1);
                }
            } else {
                showAlert('error', 'Không thể tải dữ liệu nhân viên', 'Lỗi');
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
        setFormData({
            username: '',
            password: '',
            fullName: '',
            email: '',
            phone: '',
            role: 'STAFF'
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: StaffItem) => {
        setEditingItem(item);
        setFormData({
            username: item.username,
            password: '', // Khi edit không hiển thị password cũ
            fullName: item.fullName,
            email: item.email,
            phone: item.phone,
            role: item.role,
        });
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (id: string | number) => {
        setDeleteItemId(id);
        setIsDeleteModalOpen(true);
    };

    const handleSaveItem = async () => {
        if (!formData.username.trim() || !formData.fullName.trim()) {
            alert('Vui lòng nhập tên đăng nhập và họ tên!');
            return;
        }

        const isEditMode = !!editingItem;

        if (!isEditMode && !formData.password) {
            alert('Vui lòng nhập mật khẩu cho nhân viên mới!');
            return;
        }

        const payload: any = {
            username: formData.username.trim(),
            fullName: formData.fullName.trim(),
            email: formData.email.trim() || undefined,
            phone: formData.phone.trim() || undefined,
            role: formData.role,
        };


        // Chỉ gửi password nếu có nhập (dùng cho cả tạo mới và cập nhật password)
        if (formData.password) {
            payload.password = formData.password;
        }

        const url = isEditMode ? `/users/${editingItem.id}` : '/users';
        const method = isEditMode ? 'patch' : 'post';

        try {
            const response = await axiosClient(url, {
                method: method,
                data: payload
            });

            if (response.data) {
                showAlert(
                    'success',
                    isEditMode ? 'Cập nhật thông tin nhân sự thành công!' : 'Đã tạo tài khoản nhân viên mới',
                    'Thành công'
                );
                setIsModalOpen(false);
                setEditingItem(null);
                fetchStaff();
            } else {
                showAlert('error', response.data.message || 'Thao tác thất bại', 'Lỗi hệ thống');
            }
        } catch (error: any) {
            console.error('Lỗi khi gọi API:', error);
            const errorMsg = error.response?.data?.message || 'Đã xảy ra lỗi kết nối với máy chủ!';
            showAlert('error', errorMsg, 'Lỗi hệ thống');
        }
    };

    const handleDeleteItem = async (id: string | number) => {
        if (!id) return;

        try {
            const response = await axiosClient.delete(`/users/${id}`);

            if (response.data) {
                showAlert('success', 'Đã xóa tài khoản nhân viên!', 'Thành công');
                fetchStaff();
            } else {
                showAlert('error', response.data.message || 'Không thể xóa tài khoản này', 'Lỗi hệ thống');
            }
        } catch (error) {
            console.error('Lỗi khi gọi API xóa:', error);
            showAlert('error', 'Đã xảy ra lỗi kết nối với máy chủ!', 'Lỗi hệ thống');
        }
    };

    // Hàm phụ trợ để render màu cho Badge dựa vào Role
    const getRoleVariant = (role: string) => {
        switch (role) {
            case 'MANAGER': return 'danger';
            case 'CHEF': return 'warning';
            case 'SHIPPER': return 'info';
            case 'STAFF':
            default: return 'primary';
        }
    };

    const columns: Column<StaffItem>[] = [
        { key: 'id', title: 'ID' },
        {
            key: 'username',
            title: 'Tên đăng nhập',
            render: (item) => <strong style={{ color: '#333' }}>{item.username}</strong>
        },
        { key: 'fullName', title: 'Họ và tên' },
        {
            key: 'contact',
            title: 'Liên hệ',
            render: (item) => (
                <div style={{ fontSize: '0.9rem' }}>
                    <div>{item.phone || <span style={{ color: '#999' }}>Chưa cập nhật SĐT</span>}</div>
                    <div style={{ color: '#666' }}>{item.email || ''}</div>
                </div>
            )
        },
        {
            key: 'role',
            title: 'Vai trò',
            render: (item) => (
                <Badge variant={getRoleVariant(item.role)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {item.role === 'MANAGER' && <Shield size={12} />}
                        {item.role}
                    </div>
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
        <div className="staff-management-view">
            <div className="view-header">
                <div>
                    <h1 className="view-title">Quản lí nhân sự</h1>
                    <p className="view-subtitle">Quản lí tài khoản và phân quyền cho nhân viên</p>
                </div>
                <button className="btn-add-new" onClick={handleOpenAddModal}>
                    <Plus size={18} /> Thêm nhân viên
                </button>
            </div>

            <StaffFilterBar
                searchTerm={searchTerm}
                onSearchChange={(val) => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                }}
                selectedRole={selectedRole}
                onRoleChange={(val) => {
                    setSelectedRole(val);
                    setCurrentPage(1);
                }}
                roleOptions={roleOptions}
            />

            <div className="view-content">
                <DataTable
                    columns={columns}
                    data={staffList}
                    emptyMessage={isLoading ? 'Đang tải dữ liệu...' : 'Không tìm thấy nhân viên nào khớp với bộ lọc'}
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
                title={editingItem ? 'Cập nhật tài khoản nhân viên' : 'Tạo tài khoản nhân viên mới'}
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
                <StaffForm
                    formData={formData}
                    onChange={setFormData}
                    roleOptions={roleOptions.filter(opt => opt.value !== 'Tất cả')} // Không cho phép chọn "Tất cả" khi tạo
                    isEditMode={!!editingItem}
                />
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Xác nhận xóa tài khoản"
                message={`Bạn có chắc chắn muốn xóa tài khoản nhân viên này? Hành động này không thể hoàn tác.`}
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

export default StaffManagementView;