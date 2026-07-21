import React from 'react';
import { Search } from 'lucide-react';
import SelectBox, { type SelectOption } from '../../../components/SelectBox';
import './OrderFilterBar.css';

interface OrderFilterBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;

    selectedStatus: string;
    onStatusChange: (value: string) => void;
    statusOptions: SelectOption[];
}

const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
    searchTerm,
    onSearchChange,
    searchPlaceholder = 'Tìm kiếm...',
    selectedStatus,
    onStatusChange,
    statusOptions
}) => {
    return (
        <div className="order-filter-bar">
            {/* Ô tìm kiếm */}
            <div className="filter-search-box">
                <Search className="filter-search-icon" size={18} />
                <input
                    type="text"
                    className="filter-search-input"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Ô Lọc danh mục */}
            <div className="filter-select-box">
                <SelectBox
                    options={statusOptions}
                    value={selectedStatus}
                    onChange={onStatusChange}
                />
            </div>
        </div>
    );
};

export default OrderFilterBar;