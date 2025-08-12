// src/components/ModalTable.tsx
import React from 'react';

interface ModalTableProps {
  title: string;
  data: any[]; // Replace with your actual data type
  columns: { header: string; accessor: string | ((item: any) => any) }[];
}

const ModalTable: React.FC<ModalTableProps> = ({ title, data, columns }) => (
  <div className="modal-table-section">
    <div className="section-title">{title}</div>
    <div className="scroll-area">
      <table className="data-table table-col-widths">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              {columns.map((col, index) => (
                <td key={index}>
                  {typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ModalTable;