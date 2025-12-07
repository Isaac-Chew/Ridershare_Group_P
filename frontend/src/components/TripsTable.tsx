import React from 'react';
import { Trip, RideStatus } from '../types';

interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface TripsTableProps {
  data: Trip[];
  isLoading?: boolean;
  onAccept?: (trip: Trip) => void;
  onMarkDone?: (trip: Trip) => void;
}

const statusColors: Record<RideStatus, string> = {
  Requested: '#6b7280', // gray
  InProgress: '#3b82f6', // blue
  Completed: '#10b981', // green
  Cancelled: '#ef4444', // red
};

function StatusBadge({ status }: { status: RideStatus }) {
  const bg = statusColors[status] || '#6b7280';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '9999px',
        backgroundColor: bg,
        color: 'white',
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

function TripsTable({ data, isLoading = false, onAccept, onMarkDone }: TripsTableProps) {
  const columns: TableColumn<Trip>[] = [
    { key: 'RideID', label: 'Ride ID' },
    { key: 'PickUpLocation', label: 'Pick Up Location' },
    { key: 'DropOffLocation', label: 'Drop Off Location' },
    { key: 'EstimatedTime', label: 'Est. Time (min)' },
    { key: 'Fare', label: 'Fare', render: (v) => `$${Number(v ?? 0).toFixed(2)}` },
    { key: 'Tip', label: 'Tip', render: (v) => `$${Number(v ?? 0).toFixed(2)}` },
    { key: 'RideStatus', label: 'Status', render: (v) => <StatusBadge status={v as RideStatus} /> },
    { key: 'RiderID', label: 'Rider Email' },
    { key: 'DriverID', label: 'Driver Email', render: (v) => (v == null ? '-' : String(v)) },
  ];

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
            {(onAccept || onMarkDone) && (
              <th
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
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length + ((onAccept || onMarkDone) ? 1 : 0)} 
                style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#64748b',
                  fontSize: '14px',
                }}
              >
                No trips found.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.RideID}
                style={{
                  borderBottom: '1px solid #e5e7eb',
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
                {(onAccept || onMarkDone) && (
                  <td style={{ padding: '16px' }}>
                    {onAccept && row.RideStatus === 'Requested' && (
                      <button
                        onClick={() => onAccept(row)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 500,
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#059669';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#10b981';
                        }}
                      >
                        Accept
                      </button>
                    )}
                    {onMarkDone && row.RideStatus === 'InProgress' && (
                      <button
                        onClick={() => onMarkDone(row)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 500,
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#059669';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#10b981';
                        }}
                      >
                        Mark done
                      </button>
                    )}
                    {(!onAccept || row.RideStatus !== 'Requested') && 
                     (!onMarkDone || row.RideStatus !== 'InProgress') && (
                      <span style={{ color: '#64748b', fontSize: '12px' }}>No actions</span>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TripsTable;
