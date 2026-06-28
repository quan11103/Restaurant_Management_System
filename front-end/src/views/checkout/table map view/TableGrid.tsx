import React from 'react';
import TableItem, { type TableModel } from './TableItem';
import './TableGrid.css';

interface TableGridProps {
    tables: TableModel[];
    onTableClick: (table: TableModel) => void;
}

const TableGrid: React.FC<TableGridProps> = ({ tables, onTableClick }) => {
    return (
        <div className="table-grid">
            {tables.length > 0 ? (
                tables.map(table => (
                    <TableItem
                        key={table.id}
                        table={table}
                        onClick={onTableClick}
                    />
                ))
            ) : (
                <div className="no-results">Không tìm thấy bàn phù hợp</div>
            )}
        </div>
    );
};

export default TableGrid;