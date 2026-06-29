import React from 'react';
import { Phone, MapPin, Building2, X } from 'lucide-react';
import './SupplierInfoCard.css';

export interface Supplier {
    id: number;
    name: string;
    phone: string;
    address: string;
}

interface SupplierInfoCardProps {
    supplier: Supplier | null;
    onRemove?: () => void;
}

const SupplierInfoCard: React.FC<SupplierInfoCardProps> = ({ supplier, onRemove }) => {
    if (!supplier) return null;

    return (
        <div className="supplier-info-card">
            <div className="sic-header">
                <div className="sic-title">
                    <Building2 size={18} className="sic-icon-primary" />
                    <h4>{supplier.name}</h4>
                </div>
                {/* Nút hủy chọn chỉ hiển thị khi có truyền hàm onRemove */}
                {onRemove && (
                    <button className="sic-btn-remove" onClick={onRemove} title="Đổi nhà cung cấp khác">
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="sic-body">
                <div className="sic-row">
                    <Phone size={16} className="sic-icon" />
                    <span>{supplier.phone}</span>
                </div>
                <div className="sic-row">
                    <MapPin size={16} className="sic-icon" />
                    <span>{supplier.address}</span>
                </div>
            </div>
        </div>
    );
};

export default SupplierInfoCard;