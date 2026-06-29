import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import './SearchableSelect.css';

export interface SearchOption {
    value: string | number;
    label: string;
    rawData?: any;          // Chứa toàn bộ object gốc (Supplier, Ingredient...) để dùng lại khi chọn
}

interface SearchableSelectProps {
    options: SearchOption[];
    selectedOption: SearchOption | null;
    onSelect: (option: SearchOption | null) => void;
    placeholder?: string;
    emptyText?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    selectedOption,
    onSelect,
    placeholder = "Tìm kiếm...",
    emptyText = "Không tìm thấy kết quả"
}) => {
    const [searchText, setSearchText] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Đồng bộ state searchText khi giá trị selectedOption thay đổi từ component cha
    useEffect(() => {
        if (selectedOption) {
            setSearchText(selectedOption.label);
        } else {
            setSearchText('');
        }
    }, [selectedOption]);

    // Lọc danh sách dựa trên text đang gõ
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleSelect = (opt: SearchOption) => {
        setSearchText(opt.label);
        setShowSuggestions(false);
        onSelect(opt);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setShowSuggestions(true);

        // Nếu user gõ text khác với option đã chọn trước đó, ta xóa lựa chọn cũ đi
        if (selectedOption && e.target.value !== selectedOption.label) {
            onSelect(null);
        }
    };

    return (
        <div className="searchable-select-container">
            <Search size={18} className="search-icon" />
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={searchText}
                onFocus={() => setShowSuggestions(true)}
                // setTimeout giúp tránh việc click vào item bị block bởi sự kiện onBlur
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                onChange={handleChange}
            />

            {showSuggestions && (
                <div className="suggestions-dropdown">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(opt => (
                            <div
                                key={opt.value}
                                className="suggestion-item"
                                onClick={() => handleSelect(opt)}
                            >
                                {opt.label}
                            </div>
                        ))
                    ) : (
                        <div className="suggestion-empty">{emptyText}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;