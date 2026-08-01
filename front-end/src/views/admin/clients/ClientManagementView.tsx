import React, { useState, useEffect } from 'react';
import { Eye, Trash2, ShoppingBag, DollarSign, Star, Utensils } from 'lucide-react';
import axiosClient from '../../../api/axios';
import { useAlert } from '../../../components/Alert';
import DataTable, { type Column } from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import ConfirmModal from '../../../components/ConfirmModal';
import InfoCard from '../../../components/InfoCard';
import Pagination from '../../../components/Pagination';
import './ClientManagementView.css';

// Interface cho danh sách Khách hàng (User có role CLIENT)
export interface ClientItem {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    _count?: {
        clientOrders: number;
        clientReviews: number;
    };
}

// Interface dữ liệu chi tiết trả về từ API findCustomerDetail
export interface CustomerDetailResponse {
    profile: ClientItem;
    statistics: {
        totalOrders: number;
        totalReviews: number;
        totalSpent: number;
    };
    recentOrders: Array<{
        id: number;
        orderTime: string;
        orderType: string;
        status: string;
        total: number;
        totalQuantity: number;
        bill?: {
            paymentStatus: string;
            paymentMethod: string;
        };
    }>;
    recentReviews: Array<{
        id: number;
        rating: number;
        comment: string;
        updatedAt: string;
        dish: { id: number; name: string };
    }>;
    favoriteDishes: Array<{
        dishId: number;
        dishName: string;
        price: number;
        timesOrdered: number;
        views: number;
    }>;
}

const ClientManagementView: React.FC = () => {
    const { showAlert } = useAlert();

    const [clients, setClients] = useState<ClientItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modals
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // State lưu thông tin chi tiết từ API findCustomerDetail
    const [customerDetail, setCustomerDetail] = useState<CustomerDetailResponse | null>(null);
    const [selectedClientForDelete, setSelectedClientForDelete] = useState<ClientItem | null>(null);

    // Lấy danh sách khách hàng (chỉ lấy role CLIENT nếu backend hỗ trợ query role, hoặc filter ở backend)
    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get('/users', {
                params: {
                    search: searchTerm,
                    page: currentPage,
                    limit: 10,
                    role: 'CLIENT' // Nếu backend findAll hỗ trợ lọc role
                }
            });

            const data = response.data.data || response.data;
            setClients(Array.isArray(data) ? data : []);

            if (response.data.pagination) {
                setCurrentPage(response.data.pagination.currentPage || 1);
                setTotalPages(response.data.pagination.totalPages || 1);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách khách hàng:", error);
            showAlert('error', 'Không thể tải danh sách khách hàng từ hệ thống', 'Lỗi');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [currentPage, searchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Gọi API findCustomerDetail
    const handleOpenQuickView = async (client: ClientItem) => {
        try {
            const response = await axiosClient.get(`/users/${client.id}/customer-detail`);
            setCustomerDetail(response.data);
            setIsViewModalOpen(true);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết khách hàng:", error);
            showAlert('error', 'Không thể lấy thông tin chi tiết khách hàng', 'Lỗi');
        }
    };

    const handleOpenDeleteModal = (client: ClientItem) => {
        setSelectedClientForDelete(client);
        setIsDeleteModalOpen(true);
    };

    // Gọi API remove user
    const handleDeleteClient = async () => {
        if (!selectedClientForDelete) return;

        try {
            await axiosClient.delete(`/users/${selectedClientForDelete.id}`);
            setClients(prev => prev.filter(c => c.id !== selectedClientForDelete.id));
            showAlert('success', `Đã xóa tài khoản khách hàng #${selectedClientForDelete.id}`, 'Thành công');
        } catch (error) {
            console.error("Lỗi khi xóa khách hàng:", error);
            showAlert('error', 'Không thể xóa tài khoản khách hàng này', 'Lỗi');
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    // Các cột cho DataTable
    const columns: Column<ClientItem>[] = [
        { key: 'id', title: 'Mã KH', render: (item) => <strong>#{item.id}</strong> },
        {
            key: 'customer',
            title: 'Khách hàng',
            render: (item) => (
                <div className="customer-cell">
                    <span className="customer-name">{item.fullName}</span>
                    <span className="customer-sub font-mono">@{item.username}</span>
                </div>
            )
        },
        {
            key: 'contact',
            title: 'Liên hệ',
            render: (item) => (
                <div className="customer-cell">
                    <span className="customer-contact">{item.phone || 'Chưa có SĐT'}</span>
                    <span className="customer-contact email">{item.email}</span>
                </div>
            )
        },
        {
            key: 'address',
            title: 'Địa chỉ',
            render: (item) => (
                <span className="address-text" title={item.address}>
                    {item.address || 'Chưa cập nhật'}
                </span>
            )
        },
        {
            key: 'ordersCount',
            title: 'Đơn đã đặt',
            render: (item) => (
                <span className="orders-badge">
                    {item._count?.clientOrders ?? 0} đơn
                </span>
            )
        },
        {
            key: 'actions',
            title: 'Thao tác',
            render: (item) => (
                <div className="action-buttons">
                    <button className="btn-action view" onClick={() => handleOpenQuickView(item)} title="Xem chi tiết hồ sơ">
                        <Eye size={18} />
                    </button>
                    <button className="btn-action delete" onClick={() => handleOpenDeleteModal(item)} title="Xóa khách hàng">
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="client-management-view">
            <div className="view-header">
                <div>
                    <h1 className="view-title">Quản lý khách hàng</h1>
                    <p className="view-subtitle">Theo dõi thông tin, lịch sử mua hàng và món ăn yêu thích của khách hàng</p>
                </div>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="client-filter-bar">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, SĐT hoặc username..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
            </div>

            {/* Bảng danh sách */}
            <div className="view-content">
                <DataTable
                    columns={columns}
                    data={clients}
                    emptyMessage={isLoading ? "Đang tải danh sách khách hàng..." : "Không tìm thấy khách hàng nào"}
                />
            </div>

            {/* Phân trang */}
            <div className="pagination-wrapper">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Modal Chi tiết Khách hàng (Render dữ liệu từ findCustomerDetail) */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={`Hồ sơ chi tiết Khách hàng: ${customerDetail?.profile.fullName || ''}`}
                maxWidth="900px"
            >
                {customerDetail && (
                    <div className="customer-detail-container">
                        {/* 1. Thống kê tổng quan */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon spent"><DollarSign size={24} /></div>
                                <div className="stat-info">
                                    <span className="stat-label">Tổng chi tiêu</span>
                                    <strong className="stat-value text-danger">
                                        {customerDetail.statistics.totalSpent.toLocaleString('vi-VN')} đ
                                    </strong>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon orders"><ShoppingBag size={24} /></div>
                                <div className="stat-info">
                                    <span className="stat-label">Tổng đơn hoàn thành</span>
                                    <strong className="stat-value">{customerDetail.statistics.totalOrders} đơn</strong>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon reviews"><Star size={24} /></div>
                                <div className="stat-info">
                                    <span className="stat-label">Đánh giá đã gửi</span>
                                    <strong className="stat-value">{customerDetail.statistics.totalReviews} lượt</strong>
                                </div>
                            </div>
                        </div>

                        {/* 2. Grid thông tin chi tiết */}
                        <div className="detail-grid">
                            {/* Cột trái: Thông tin cá nhân & Món ăn yêu thích */}
                            <div className="detail-column">
                                <InfoCard title="Thông tin cá nhân">
                                    <div className="info-list">
                                        <div className="info-item">
                                            <span>Mã KH:</span>
                                            <strong>#{customerDetail.profile.id}</strong>
                                        </div>
                                        <div className="info-item">
                                            <span>Tên tài khoản:</span>
                                            <strong>{customerDetail.profile.username}</strong>
                                        </div>
                                        <div className="info-item">
                                            <span>Email:</span>
                                            <strong>{customerDetail.profile.email}</strong>
                                        </div>
                                        <div className="info-item">
                                            <span>Số điện thoại:</span>
                                            <strong>{customerDetail.profile.phone || 'N/A'}</strong>
                                        </div>
                                        <div className="info-item">
                                            <span>Địa chỉ:</span>
                                            <strong>{customerDetail.profile.address || 'Chưa cập nhật'}</strong>
                                        </div>
                                    </div>
                                </InfoCard>

                                <InfoCard title="Món ăn yêu thích nhất">
                                    {customerDetail.favoriteDishes.length === 0 ? (
                                        <p className="empty-text">Chưa có dữ liệu món ăn yêu thích</p>
                                    ) : (
                                        <ul className="favorite-dish-list">
                                            {customerDetail.favoriteDishes.map((dish) => (
                                                <li key={dish.dishId} className="favorite-dish-item">
                                                    <div className="dish-info">
                                                        <Utensils size={16} className="dish-icon" />
                                                        <span className="dish-name">{dish.dishName}</span>
                                                    </div>
                                                    <span className="dish-count">{dish.timesOrdered} lần gọi</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </InfoCard>
                            </div>

                            {/* Cột phải: Lịch sử đơn hàng gần đây */}
                            <div className="detail-column">
                                <InfoCard title="Đơn hàng gần đây">
                                    {customerDetail.recentOrders.length === 0 ? (
                                        <p className="empty-text">Chưa có đơn hàng nào</p>
                                    ) : (
                                        <div className="recent-orders-list">
                                            {customerDetail.recentOrders.map((order) => (
                                                <div key={order.id} className="recent-order-item">
                                                    <div className="order-item-header">
                                                        <strong>Đơn #{order.id}</strong>
                                                        <span className={`order-status-badge status-${order.status.toLowerCase()}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="order-item-body">
                                                        <span>{new Date(order.orderTime).toLocaleDateString('vi-VN')}</span>
                                                        <strong className="text-danger">
                                                            {Number(order.total).toLocaleString('vi-VN')} đ
                                                        </strong>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </InfoCard>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal xác nhận xóa khách hàng */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Xóa tài khoản khách hàng"
                message={`Bạn có chắc chắn muốn xóa tài khoản của khách hàng ${selectedClientForDelete?.fullName} (#${selectedClientForDelete?.id}) không? Thao tác này không thể hoàn tác.`}
                confirmLabel="Xóa tài khoản"
                cancelLabel="Hủy"
                onConfirm={handleDeleteClient}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
};

export default ClientManagementView;