import React, { type KeyboardEvent, useRef } from 'react';
import { Search, XCircle } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch?: () => void;
    placeholder?: string
    className?: string;
    autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    onSearch,
    placeholder = "Tìm kiếm món ăn, đồ uống...",
    className = "",
    autoFocus = false
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Bắt sự kiện bấm phím Enter
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch();
            inputRef.current?.blur(); // Tắt bàn phím ảo trên điện thoại sau khi search
        }
    };

    // Hàm xóa nhanh nội dung tìm kiếm
    const handleClear = () => {
        onChange('');
        inputRef.current?.focus(); // Trả lại con trỏ chuột vào ô input
    };

    return (
        <div className={`search-bar-wrapper ${className}`}>
            <input
                ref={inputRef}
                type="text"
                className="search-bar-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus={autoFocus}
            />

            {value.length > 0 && (
                <button
                    className="search-bar-btn clear-btn"
                    onClick={handleClear}
                    aria-label="Xóa từ khóa"
                >
                    <XCircle size={18} />
                </button>
            )}

            <button
                className="search-bar-btn submit-btn"
                onClick={onSearch}
                aria-label="Tìm kiếm"
            >
                <Search size={18} />
            </button>
        </div>
    );
};

export default SearchBar;