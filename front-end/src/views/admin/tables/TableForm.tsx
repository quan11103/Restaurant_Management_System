import React from 'react';
import './TableForm.css';

export interface TableFormData {
    name: string;
    capacity: number | string; // Sức chứa (Số người)
    isOccupied: boolean;
    description: string; // Ghi chú thêm
}

interface TableFormProps {
    formData: TableFormData;
    onChange: (data: TableFormData) => void;
}

const TableForm: React.FC<TableFormProps> = ({ formData, onChange }) => {
    const handleChange = (field: keyof TableFormData, value: any) => {
        onChange({ ...formData, [field]: value });
    };

    return (
        <div className="table-form-grid">
            <div className="form-group">
                <label className="form-label">Tên bàn</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Số chỗ</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.capacity}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Chỉ cho phép nhập số
                        handleChange('capacity', value ? Number(value) : '');
                    }}
                />
            </div>

            <div className="form-group col-span-full">
                <label className="form-label">Ghi chú</label>
                <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                />
            </div>

            <div className="form-group col-span-full">
                <label className="form-label">Trạng thái bàn</label>
                <div className="radio-group">
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="table-status"
                            checked={formData.isOccupied === false}
                            onChange={() => handleChange('isOccupied', false)}
                        />
                        Trống
                    </label>
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="table-status"
                            checked={formData.isOccupied === true}
                            onChange={() => handleChange('isOccupied', true)}
                        />
                        Đang sử dụng
                    </label>
                </div>
            </div>
        </div>
    );
};

export default TableForm;