import React from 'react';
import SelectBox, { type SelectOption } from '../../../components/SelectBox';
import './MenuForm.css';

export interface MenuFormData {
    name: string;
    category: string;
    price: number | string;
    status: 'Có thể gọi' | 'Tạm ngưng';
}

interface MenuFormProps {
    formData: MenuFormData;
    onChange: (data: MenuFormData) => void;
    categoryOptions: SelectOption[];
}

const MenuForm: React.FC<MenuFormProps> = ({ formData, onChange, categoryOptions }) => {

    // Hàm cập nhật từng trường dữ liệu mà không làm mất các trường khác
    const handleChange = (field: keyof MenuFormData, value: any) => {
        onChange({ ...formData, [field]: value });
    };

    return (
        <div className="menu-form-grid">
            <div className="form-group">
                <label className="form-label">Tên món ăn / thức uống</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Danh mục</label>
                <SelectBox
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(val) => handleChange('category', val)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Giá bán (VNĐ)</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Chỉ cho phép nhập số
                        handleChange('price', value ? Number(value) : '');
                    }}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Trạng thái kinh doanh</label>
                <div className="radio-group">
                    <label className="radio-label">
                        <input
                            type="radio"
                            checked={formData.status === 'Có thể gọi'}
                            onChange={() => handleChange('status', 'Có thể gọi')}
                        />
                        Có thể gọi
                    </label>
                    <label className="radio-label">
                        <input
                            type="radio"
                            checked={formData.status === 'Tạm ngưng'}
                            onChange={() => handleChange('status', 'Tạm ngưng')}
                        />
                        Tạm ngưng (hết nguyên liệu)
                    </label>
                </div>
            </div>
        </div>
    );
};

export default MenuForm;