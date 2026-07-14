import React from 'react';
import SelectBox, { type SelectOption } from '../../../components/SelectBox';
import './PromotionForm.css';

export interface PromotionFormData {
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number | string;
    description: string;
    startDate: string;
    endDate: string;
    minOrderValue: number | string;
    maxDiscount: number | string;
    usageLimit: number | string;
}

interface PromotionFormProps {
    formData: PromotionFormData;
    onChange: (data: PromotionFormData) => void;
}

const typeOptions: SelectOption[] = [
    { label: 'Phần trăm (%)', value: 'PERCENTAGE' },
    { label: 'Số tiền cố định (VNĐ)', value: 'FIXED_AMOUNT' },
];

const PromotionForm: React.FC<PromotionFormProps> = ({ formData, onChange }) => {
    const handleChange = (field: keyof PromotionFormData, value: any) => {
        onChange({ ...formData, [field]: value });
    };

    return (
        <div className="promotion-form-grid">
            <div className="form-group">
                <label className="form-label">Mã khuyến mãi *</label>
                <input
                    type="text"
                    className="form-input code-input"
                    value={formData.code}
                    onChange={(e) => {
                        // Tự động viết hoa và loại bỏ khoảng trắng
                        const val = e.target.value.toUpperCase().replace(/\s/g, '');
                        handleChange('code', val);
                    }}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Loại khuyến mãi *</label>
                <SelectBox
                    options={typeOptions}
                    value={formData.type}
                    onChange={(val) => {
                        const newType = val as 'PERCENTAGE' | 'FIXED_AMOUNT';
                        onChange({
                            ...formData,
                            type: newType,
                            maxDiscount: newType === 'FIXED_AMOUNT' ? '' : formData.maxDiscount,
                        });
                    }}
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    Giá trị giảm * ({formData.type === 'PERCENTAGE' ? '%' : 'VNĐ'})
                </label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.value}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        let numVal = value ? Number(value) : '';
                        if (formData.type === 'PERCENTAGE' && typeof numVal === 'number' && numVal > 100) {
                            numVal = 100;
                        }
                        handleChange('value', numVal);
                    }}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Giới hạn số lượt sử dụng</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Bỏ trống nếu không giới hạn"
                    value={formData.usageLimit}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleChange('usageLimit', value ? Number(value) : '');
                    }}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Ngày bắt đầu *</label>
                <input
                    type="date"
                    className="form-input"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Ngày kết thúc *</label>
                <input
                    type="date"
                    className="form-input"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Đơn hàng tối thiểu (VNĐ)</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Bỏ trống nếu không yêu cầu"
                    value={formData.minOrderValue}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleChange('minOrderValue', value ? Number(value) : '');
                    }}
                />
            </div>

            {formData.type === 'PERCENTAGE' ? (
                <div className="form-group">
                    <label className="form-label">Số tiền giảm tối đa (VNĐ)</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Bỏ trống nếu không giới hạn"
                        value={formData.maxDiscount}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            handleChange('maxDiscount', value ? Number(value) : '');
                        }}
                    />
                </div>
            ) : (
                <div className="form-group placeholder-group">
                    {/* Placeholder to align grid when PERCENTAGE is not selected */}
                </div>
            )}

            <div className="form-group col-span-full">
                <label className="form-label">Mô tả chương trình khuyến mãi</label>
                <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                />
            </div>
        </div>
    );
};

export default PromotionForm;
