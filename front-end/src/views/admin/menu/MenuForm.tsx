import React, { useState } from 'react';
import SelectBox, { type SelectOption } from '../../../components/SelectBox';
import './MenuForm.css';

export interface DishImageInput {
    imageUrl: string;
    isMain: boolean;
}

export interface MenuFormData {
    name: string;
    category: string;
    price: number | string;
    isAvailable: 'Có thể gọi' | 'Tạm ngừng';
    description: string;
    images: DishImageInput[];
}

interface MenuFormProps {
    formData: MenuFormData;
    onChange: (data: MenuFormData) => void;
    categoryOptions: SelectOption[];
}

const MenuForm: React.FC<MenuFormProps> = ({ formData, onChange, categoryOptions }) => {
    const [tempImageUrl, setTempImageUrl] = useState('');

    const handleChange = (field: keyof MenuFormData, value: any) => {
        onChange({ ...formData, [field]: value });
    };

    const handleAddImage = () => {
        if (!tempImageUrl.trim()) return;

        const isFirstImage = formData.images.length === 0;

        const newImage: DishImageInput = {
            imageUrl: tempImageUrl.trim(),
            isMain: isFirstImage,
        };

        handleChange('images', [...formData.images, newImage]);
        setTempImageUrl('');
    };

    const handleSetMainImage = (indexToSet: number) => {
        const updatedImages = formData.images.map((img, idx) => ({
            ...img,
            isMain: idx === indexToSet,
        }));
        handleChange('images', updatedImages);
    };

    const handleRemoveImage = (indexToRemove: number) => {
        const targetImage = formData.images[indexToRemove];
        let updatedImages = formData.images.filter((_, idx) => idx !== indexToRemove);

        // Nếu xóa ảnh đang là "ảnh chính" và danh sách vẫn còn ảnh, tự động chuyển ảnh đầu tiên còn lại làm ảnh chính.
        if (targetImage.isMain && updatedImages.length > 0) {
            updatedImages[0].isMain = true;
        }

        handleChange('images', updatedImages);
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

            <div className="form-group col-span-full">
                <label className="form-label">Mô tả món ăn</label>
                <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                />
            </div>

            <div className="form-group col-span-full image-section">
                <label className="form-label">Hình ảnh món ăn (Cho phép thêm nhiều ảnh)</label>

                <div className="image-input-wrapper">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Dán đường dẫn (URL) hình ảnh vào đây..."
                        value={tempImageUrl}
                        onChange={(e) => setTempImageUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                    />
                    <button type="button" className="btn-add-image" onClick={handleAddImage}>
                        Thêm ảnh
                    </button>
                </div>

                {/* Danh sách các ảnh đã thêm */}
                {formData.images.length > 0 && (
                    <div className="image-preview-list">
                        {formData.images.map((img, index) => (
                            <div key={index} className={`image-preview-item ${img.isMain ? 'is-main-border' : ''}`}>
                                <img src={img.imageUrl} alt={`dish-preview-${index}`} className="preview-img-thumb" />

                                <div className="preview-actions">
                                    <label className="main-image-radio">
                                        <input
                                            type="radio"
                                            name="main-image-selector"
                                            checked={img.isMain}
                                            onChange={() => handleSetMainImage(index)}
                                        />
                                        <span>Ảnh chính</span>
                                    </label>

                                    <button
                                        type="button"
                                        className="btn-delete-img"
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Trạng thái kinh doanh</label>
                    <div className="radio-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="dish-status"
                                checked={formData.isAvailable === 'Có thể gọi'}
                                onChange={() => handleChange('isAvailable', 'Có thể gọi')}
                            />
                            Có thể gọi
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="dish-status"
                                checked={formData.isAvailable === 'Tạm ngừng'}
                                onChange={() => handleChange('isAvailable', 'Tạm ngừng')}
                            />
                            Tạm ngừng (hết nguyên liệu)
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuForm;