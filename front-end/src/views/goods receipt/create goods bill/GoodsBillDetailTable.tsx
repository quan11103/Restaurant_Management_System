import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import DecimalNumberInput from '../../../components/DecimalNumberInput';
import './GoodsBillDetailTable.css';

export interface Ingredient {
    id: number;
    name: string;
    unit: string;
    price: number;
}

export interface BillItem {
    tempId: string;
    ingredientId: number | null;
    unit: string;
    quantity: number;
    price: number;
}

interface GoodsBillDetailTableProps {
    items: BillItem[];
    ingredients: Ingredient[];
    onAddRow: () => void;
    onRemoveRow: (tempId: string) => void;
    onChangeItem: (tempId: string, field: keyof BillItem, value: any) => void;
}

const GoodsBillDetailTable: React.FC<GoodsBillDetailTableProps> = ({
    items,
    ingredients,
    onAddRow,
    onRemoveRow,
    onChangeItem
}) => {
    return (
        <div className="gb-card flex-1 table-card">
            <h3>Chi tiết nguyên liệu nhập</h3>

            <div className="gb-table-wrapper">
                <table className="gb-table">
                    <thead>
                        <tr>
                            <th style={{ width: '35%' }}>Tên nguyên liệu</th>
                            <th style={{ width: '10%' }}>Đơn vị</th>
                            <th style={{ width: '15%' }}>Số lượng</th>
                            <th style={{ width: '15%' }}>Đơn giá nhập</th>
                            <th style={{ width: '15%' }}>Thành tiền</th>
                            <th style={{ width: '10%' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center empty-state">
                                    Chưa có nguyên liệu nào. Bấm "+ Thêm dòng mới" để bắt đầu.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => {
                                // Tính toán thành tiền cho từng dòng
                                const lineTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);

                                return (
                                    <tr key={item.tempId}>
                                        <td>
                                            <select
                                                value={item.ingredientId || ''}
                                                onChange={(e) => onChangeItem(item.tempId, 'ingredientId', e.target.value)}
                                                className="table-input"
                                            >
                                                <option value="" disabled>Chọn nguyên liệu...</option>
                                                {ingredients.map(ing => (
                                                    <option key={ing.id} value={ing.id}>{ing.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="text-center unit-text">{item.unit}</td>
                                        <td>
                                            <DecimalNumberInput
                                                min="0" step="0.1"
                                                placeholder="0.0"
                                                value={item.quantity === 0 ? '' : item.quantity}
                                                // Hàm onChange giờ đây trả về thẳng chuỗi giá trị (val) thay vì object Event (e)
                                                onChange={(val) => onChangeItem(item.tempId, 'quantity', val)}
                                            />
                                        </td>
                                        <td>
                                            <DecimalNumberInput
                                                min="0" step="1000"
                                                placeholder="0"
                                                value={item.price === 0 ? '' : item.price}
                                                onChange={(val) => onChangeItem(item.tempId, 'price', val)}
                                            />
                                        </td>
                                        <td className="text-right font-medium">
                                            {lineTotal > 0 ? lineTotal.toLocaleString('vi-VN') : '0'} đ
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn-icon text-danger"
                                                onClick={() => onRemoveRow(item.tempId)}
                                                title="Xóa dòng"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <button className="btn-add-row" onClick={onAddRow}>
                <Plus size={18} /> Thêm dòng mới
            </button>
        </div>
    );
};

export default GoodsBillDetailTable;