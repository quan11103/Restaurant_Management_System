import React from 'react';
import { Search } from 'lucide-react';
import SelectBox, { type SelectOption } from './SelectBox';
import './MenuFilterBar.css';

interface MenuFilterBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;

    selectedCategory: string;
    onCategoryChange: (value: string) => void;
    categoryOptions: SelectOption[];
}

const MenuFilterBar: React.FC<MenuFilterBarProps> = ({
    searchTerm,
    onSearchChange,
    searchPlaceholder = 'Tìm kiếm...',
    selectedCategory,
    onCategoryChange,
    categoryOptions
}) => {
    return (
        <div className="menu-filter-bar">
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
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={onCategoryChange}
                />
            </div>
        </div>
    );
};

export default MenuFilterBar;