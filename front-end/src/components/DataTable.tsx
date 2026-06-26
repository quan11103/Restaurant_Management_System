import React, { type ReactNode } from 'react';
import './DataTable.css';

export interface Column<T> {
    key: keyof T | string; // Khóa để map với dữ liệu, hoặc khóa tự do nếu dùng render
    title: string;
    render?: (record: T) => ReactNode; // Hàm tự định nghĩa giao diện cho ô
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
}

// Sử dụng Generic Type <T> để bảng nhận diện được mọi loại object truyền vào
function DataTable<T extends Record<string, any>>({
    columns,
    data,
    emptyMessage = "Không có dữ liệu"
}: DataTableProps<T>) {

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col.title}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="empty-cell">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((record, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex}>
                                        {/* Nếu cột có hàm render tùy chỉnh thì chạy hàm, nếu không thì in ra giá trị gốc */}
                                        {col.render ? col.render(record) : record[col.key as keyof T]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;