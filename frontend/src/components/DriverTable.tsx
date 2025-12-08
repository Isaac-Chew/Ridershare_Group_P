import React from 'react';
import { Driver } from '../types';

interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  isLoading?: boolean;
}

function DriverTable({
  data,
  columns,
  onEdit,
  onDelete,
  isLoading = false,
}: TableProps<Driver>) {
  if (isLoading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        color: '#64748b',
        fontSize: '16px' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ 
      overflowX: 'auto',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                style={{
                  padding: '16px',
                  textAlign: 'left',
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#1e3a8a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#64748b',
                  fontSize: '14px',
                }}
              >
                No drivers found. Click "Add New Driver" to create one.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <React.Fragment key={index}>
                <tr
                  style={{
                    borderBottom: (onEdit || onDelete) ? 'none' : '1px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      style={{ 
                        padding: '16px',
                        fontSize: '14px',
                        color: '#1f2937',
                      }}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
                {(onEdit || onDelete) && (
                  <tr>
                    <td 
                      colSpan={columns.length}
                      style={{ 
                        padding: '12px 16px',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 500,
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#2563eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#3b82f6';
                            }}
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 500,
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ef4444';
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DriverTable;
