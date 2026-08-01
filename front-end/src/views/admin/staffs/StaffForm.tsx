import React from 'react';
import SelectBox, { type SelectOption } from '../../../components/SelectBox';
import './StaffForm.css';

export interface StaffFormData {
    username: string;
    password?: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
}

interface StaffFormProps {
    formData: StaffFormData;
    onChange: (data: StaffFormData) => void;
    roleOptions: SelectOption[];
    isEditMode: boolean; // Dùng để quyết định có disable ô username hay đổi label của ô password không
}

const StaffForm: React.FC<StaffFormProps> = ({ formData, onChange, roleOptions, isEditMode }) => {

    const handleChange = (field: keyof StaffFormData, value: string) => {
        onChange({ ...formData, [field]: value });
    };

    return (
        <div className="staff-form-grid">
            {/* Hàng 1 */}
            <div className="form-group">
                <label className="form-label">
                    Tên đăng nhập <span className="text-required">*</span>
                </label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    disabled={isEditMode}
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    {isEditMode ? 'Mật khẩu mới' : 'Mật khẩu'}
                    {!isEditMode && <span className="text-required">*</span>}
                </label>
                <input
                    type="password"
                    className="form-input"
                    value={formData.password || ''}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder={isEditMode ? 'Bỏ trống nếu không muốn đổi...' : ''}
                />
            </div>

            {/* Hàng 2 */}
            <div className="form-group">
                <label className="form-label">
                    Họ và tên <span className="text-required">*</span>
                </label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Chức vụ</label>
                <SelectBox
                    options={roleOptions}
                    value={formData.role}
                    onChange={(val) => handleChange('role', val)}
                />
            </div>

            {/* Hàng 3 */}
            <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Chỉ cho phép nhập số
                        handleChange('phone', value);
                    }}
                    maxLength={11}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Email liên hệ</label>
                <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                />
            </div>
        </div>
    );
};

export default StaffForm;