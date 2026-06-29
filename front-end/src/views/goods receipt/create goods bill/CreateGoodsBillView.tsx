import React, { useState } from 'react';
import PageHeader from '../../../components/PageHeader';
import SearchableSelect, { type SearchOption } from '../../../components/SearchableSelect';
import ConfirmModal from '../../../components/ConfirmModal';
import SupplierInfoCard from './SupplierInfoCard';
import GoodsBillDetailTable from './GoodsBillDetailTable';
import GoodsBillSummary from './GoodsBillSummary';
import ActionFooter from './ActionFooter';
import './CreateGoodsBillView.css';

export type Supplier = { id: number; name: string; phone: string; address: string };
export type Ingredient = { id: number; name: string; unit: string; price: number };

export type BillItem = {
    tempId: string; // ID tạm để quản lý key trong mảng React
    ingredientId: number | null;
    unit: string;
    quantity: number;
    price: number;
};

const MOCK_SUPPLIERS: Supplier[] = [
    { id: 1, name: 'Công ty Thực phẩm Vissan', phone: '0901234567', address: 'Quận Bình Thạnh, TP.HCM' },
    { id: 2, name: 'Đại lý Rau sạch Đà Lạt', phone: '0987654321', address: 'Đà Lạt, Lâm Đồng' }
];

const MOCK_INGREDIENTS: Ingredient[] = [
    { id: 1, name: 'Thịt bò Mỹ', unit: 'kg', price: 150000 },
    { id: 2, name: 'Rau xà lách', unit: 'kg', price: 25000 },
    { id: 3, name: 'Dầu ăn Tường An 5L', unit: 'can', price: 220000 },
];

const CreateGoodsBillView: React.FC = () => {
    // --- STATE ---
    const [targetSupplier, setTargetSupplier] = useState<Supplier | null>(null);
    const [billItems, setBillItems] = useState<BillItem[]>([]);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    // BIẾN ĐỔI DỮ LIỆU: Map mảng Supplier gốc thành mảng SearchOption chuẩn
    const supplierOptions: SearchOption[] = MOCK_SUPPLIERS.map(sup => ({
        value: sup.id,
        label: sup.name,
        rawData: sup // Nhét nguyên object Supplier vào đây để lấy ra dùng lúc sau
    }));

    // Tạo object selectedOption để truyền vào component
    const selectedSupplierOption: SearchOption | null = targetSupplier ? {
        value: targetSupplier.id,
        label: targetSupplier.name
    } : null;

    const handleAddRow = () => {
        const newItem: BillItem = {
            tempId: Math.random().toString(36).substr(2, 9),
            ingredientId: null,
            unit: '---',
            quantity: 1,
            price: 0
        };
        setBillItems([...billItems, newItem]);
    };

    const handleRemoveRow = (tempId: string) => {
        setBillItems(billItems.filter(item => item.tempId !== tempId));
    };

    const handleItemChange = (tempId: string, field: keyof BillItem, value: any) => {
        setBillItems(billItems.map(item => {
            if (item.tempId === tempId) {
                const updatedItem = { ...item, [field]: value };

                // Tự động điền đơn vị và đơn giá nếu user chọn nguyên liệu
                if (field === 'ingredientId') {
                    const selectedIng = MOCK_INGREDIENTS.find(i => i.id === Number(value));
                    if (selectedIng) {
                        updatedItem.unit = selectedIng.unit;
                        updatedItem.price = selectedIng.price;
                    }
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const handleSubmitClick = () => {
        if (!targetSupplier) {
            alert('Vui lòng chọn nhà cung cấp!');
            return;
        }

        const validItems = billItems.filter(item => item.ingredientId !== null);
        if (validItems.length === 0) {
            alert('Phiếu nhập phải có ít nhất 1 nguyên liệu hợp lệ!');
            return;
        }

        setIsSaveModalOpen(true);
    };

    const handleConfirmSave = () => {
        setIsSaveModalOpen(false);

        const validItems = billItems.filter(item => item.ingredientId !== null);
        const payload = {
            supplierId: targetSupplier?.id,
            totalAmount,
            details: validItems
        };

        console.log('Gửi dữ liệu lên API:', payload);
        alert('Tạo phiếu nhập kho thành công!');
        // Reset form hoặc chuyển hướng trang tại đây...
    };

    const totalAmount = billItems.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0);

    return (
        <div className="goods-bill-layout">
            {/* Header */}
            <PageHeader
                title="Tạo Phiếu Nhập Kho"
                showBackButton={true}
                onBack={() => console.log('Quay lại trang danh sách')}
            />

            <div className="gb-content">
                {/* Cột trái: nhập liệu */}
                <div className="gb-left-panel">
                    {/* Tìm nhà cung cấp */}
                    <div className="gb-card">
                        <h3>Thông tin Nhà cung cấp</h3>
                        <div style={{ marginBottom: '12px' }}>
                            <SearchableSelect
                                options={supplierOptions}
                                selectedOption={selectedSupplierOption}
                                placeholder="Nhập tên nhà cung cấp để tìm..."
                                emptyText="Không tìm thấy nhà cung cấp"
                                onSelect={(opt) => {
                                    if (opt) {
                                        // Rút object Supplier từ trường rawData ra để set state
                                        setTargetSupplier(opt.rawData as Supplier);
                                    } else {
                                        setTargetSupplier(null);
                                    }
                                }}
                            />
                        </div>

                        {targetSupplier && (
                            <SupplierInfoCard
                                supplier={targetSupplier}
                                onRemove={() => setTargetSupplier(null)}
                            />
                        )}
                    </div>

                    {/* Bảng chi tiết nguyên liệu */}
                    <GoodsBillDetailTable
                        items={billItems}
                        ingredients={MOCK_INGREDIENTS}
                        onAddRow={handleAddRow}
                        onRemoveRow={handleRemoveRow}
                        onChangeItem={handleItemChange}
                    />
                </div>

                {/* Cột phải: tổng kết & hành động */}
                <div className="gb-right-panel">
                    <GoodsBillSummary totalAmount={totalAmount} />

                    <ActionFooter
                        onSubmit={handleSubmitClick}
                        isSubmitDisabled={!targetSupplier || billItems.length === 0}
                        isLoading={false}
                    />
                </div>
            </div>
            <ConfirmModal
                isOpen={isSaveModalOpen}
                title="Xác nhận lưu phiếu nhập"
                type="info"
                message={"Bạn có chắc chắn muốn tạo phiếu nhập kho này không?"}
                confirmLabel="Đồng ý nhập"
                cancelLabel="Kiểm tra lại"
                onConfirm={handleConfirmSave}
                onCancel={() => setIsSaveModalOpen(false)}
            />
        </div >
    );
};

export default CreateGoodsBillView;