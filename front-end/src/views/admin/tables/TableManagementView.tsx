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
import TableFilterBar from './TableFilterBar';
import TableForm, { type TableFormData } from './TableForm';
import './TableManagementView.css';

export interface TableItem {
    id: string;
    name: string;
    capacity: number;
    description: string;
    isOccupied: boolean;
}

const statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: 'Tất cả' },
    { label: 'Trống', value: 'Trống' },
    { label: 'Có khách', value: 'Có khách' },
];

const TableManagementView: React.FC = () => {
    const { showAlert } = useAlert();

    const [tableItems, setTableItems] = useState<TableItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('Tất cả');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TableItem | null>(null);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

    const [formData, setFormData] = useState<TableFormData>({
        name: '',
        capacity: '',
        description: '',
        isOccupied: false,
    });

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchTables();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStatus, currentPage, searchTerm]);

    const fetchTables = async () => {
        setIsLoading(true);
        try {
            // Xác định param isOccupied để gửi lên API
            let isOccupiedParam: boolean | undefined = undefined;
            if (selectedStatus === 'Có khách') isOccupiedParam = true;
            if (selectedStatus === 'Trống') isOccupiedParam = false;

            const response = await axiosClient.get('/tables', {
                params: {
                    search: searchTerm,
                    isOccupied: isOccupiedParam,
                    page: currentPage,
                    limit: itemsPerPage,
                },
            });

            if (response.data) {
                const rawData = response.data.data;

                const formattedData: TableItem[] = rawData.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    capacity: item.capacity,
                    description: item.description || '',
                    isOccupied: item.isOccupied || false,
                }));

                setTableItems(formattedData);

                if (response.data.pagination) {
                    setCurrentPage(response.data.pagination.currentPage || currentPage);
                    setTotalPages(response.data.pagination.totalPages || 1);
                } else {
                    setTotalPages(response.data.totalPages || 1);
                }
            } else {
                showAlert('error', 'Không thể tải dữ liệu bàn', 'Lỗi');
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
            name: '',
            capacity: '',
            description: '',
            isOccupied: false
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: TableItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            capacity: item.capacity.toString(),
            description: item.description || '',
            isOccupied: item.isOccupied,
        });
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (id: string) => {
        setDeleteItemId(id);
        setIsDeleteModalOpen(true);
    };

    const handleSaveItem = async () => {
        if (!formData.name.trim() || !formData.capacity) {
            showAlert('warning', 'Vui lòng nhập tên bàn và sức chứa!', 'Thiếu thông tin');
            return;
        }

        const payload = {
            name: formData.name,
            capacity: Number(formData.capacity),
            description: formData.description,
            isOccupied: formData.isOccupied,
        };

        const isEditMode = !!editingItem;
        const url = isEditMode ? `/tables/${editingItem.id}` : '/tables';
        const method = isEditMode ? 'patch' : 'post';

        try {
            const response = await axiosClient(url, {
                method: method,
                data: payload
            });

            if (response.data) {
                showAlert(
                    'success',
                    isEditMode ? 'Cập nhật thông tin bàn thành công!' : 'Đã thêm bàn mới vào danh sách',
                    'Thành công'
                );
                setIsModalOpen(false);
                setEditingItem(null);
                fetchTables();
            } else {
                showAlert(
                    'error',
                    response.data.message || (isEditMode ? 'Không thể cập nhật thông tin bàn' : 'Không thể tạo bàn mới'),
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
            showAlert('error', 'Không tìm thấy ID bàn để tiến hành xóa!', 'Lỗi dữ liệu');
            return;
        }

        try {
            const response = await axiosClient.delete(`/tables/${id}`);

            if (response.data) {
                showAlert('success', 'Đã xóa bàn khỏi danh sách!', 'Thành công');
                fetchTables();
            } else {
                showAlert('error', response.data.message || 'Không thể xóa bàn này', 'Lỗi hệ thống');
            }
        } catch (error) {
            console.error('Lỗi khi gọi API xóa:', error);
            showAlert('error', 'Đã xảy ra lỗi kết nối với máy chủ!', 'Lỗi hệ thống');
        }
    };

    const columns: Column<TableItem>[] = [
        { key: 'id', title: 'Mã bàn' },
        { key: 'name', title: 'Tên bàn' },
        {
            key: 'capacity',
            title: 'Số chỗ',
            render: (item) => <span>{item.capacity}</span>
        },
        { key: 'description', title: 'Mô tả' },
        {
            key: 'isOccupied',
            title: 'Trạng thái',
            render: (item) => (
                <Badge variant={!item.isOccupied ? 'success' : 'warning'}>
                    {!item.isOccupied ? 'Trống' : 'Có khách'}
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
        <div className="table-management-view">
            <div className="view-header">
                <div>
                    <h1 className="view-title">Quản lí bàn</h1>
                    <p className="view-subtitle">Danh sách sơ đồ bàn và quản lý chỗ ngồi tại nhà hàng</p>
                </div>
                <button className="btn-add-new" onClick={handleOpenAddModal}>
                    <Plus size={18} /> Thêm bàn mới
                </button>
            </div>

            <TableFilterBar
                searchTerm={searchTerm}
                onSearchChange={(val) => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                }}
                selectedStatus={selectedStatus}
                onStatusChange={(val) => {
                    setSelectedStatus(val);
                    setCurrentPage(1);
                }}
                statusOptions={statusOptions}
            />

            <div className="view-content">
                <DataTable
                    columns={columns}
                    data={tableItems}
                    emptyMessage={isLoading ? 'Đang tải dữ liệu...' : 'Không tìm thấy bàn nào khớp với bộ lọc'}
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
                title={editingItem ? 'Cập nhật bàn' : 'Thêm bàn mới'}
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
                <TableForm
                    formData={formData}
                    onChange={setFormData}
                />
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Xác nhận xóa bàn"
                message={`Bạn có chắc chắn muốn xóa bàn này khỏi hệ thống?`}
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

export default TableManagementView;