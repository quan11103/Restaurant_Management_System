import React from 'react';
import { Search } from 'lucide-react';
import SelectBox, { type SelectOption } from '../../../components/SelectBox';
import './StaffFilterBar.css';

interface StaffFilterBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;

    selectedRole: string;
    onRoleChange: (value: string) => void;
    roleOptions: SelectOption[];
}

const StaffFilterBar: React.FC<StaffFilterBarProps> = ({
    searchTerm,
    onSearchChange,
    searchPlaceholder = 'Tìm kiếm...',
    selectedRole,
    onRoleChange,
    roleOptions
}) => {
    return (
        <div className="staff-filter-bar">
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
                    options={roleOptions}
                    value={selectedRole}
                    onChange={onRoleChange}
                />
            </div>
        </div>
    );
};

export default StaffFilterBar;