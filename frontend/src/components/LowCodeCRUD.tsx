import React, { useState } from 'react';

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'readonly';
  editable?: boolean;
  format?: (value: any, row?: any) => string;
}

interface LowCodeCRUDProps<T> {
  data: T[];
  fields: FieldConfig[];
  onUpdate: (id: number, field: string, value: any) => Promise<void>;
  idField: string;
  isLoading?: boolean;
}

function LowCodeCRUD<T extends Record<string, any>>({
  data,
  fields,
  onUpdate,
  idField,
  isLoading = false,
}: LowCodeCRUDProps<T>) {
  const [editing, setEditing] = useState<{ id: number; field: string; value: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleEdit = (id: number, field: string, currentValue: any) => {
    // For formatted values, extract the raw number if it's a currency string
    let rawValue = currentValue;
    if (typeof currentValue === 'string' && currentValue.startsWith('$')) {
      rawValue = currentValue.replace('$', '').trim();
    }
    setEditing({ id, field, value: String(rawValue || '') });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await onUpdate(editing.id, editing.field, editing.value);
      setEditing(null);
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data.length === 0) {
    return <div>No data found.</div>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
      <thead>
        <tr style={{ backgroundColor: '#f0f0f0' }}>
          {fields.map((field) => (
            <th key={field.key} style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>
              {field.label}
            </th>
          ))}
          <th style={{ padding: '8px', border: '1px solid #ccc' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => {
          const rowId = row[idField];
          return (
            <tr key={rowId}>
              {fields.map((field) => {
                const isEditing = editing?.id === rowId && editing?.field === field.key;
                const value = row[field.key];
                // For calculated fields that don't exist in row, use format with row data
                const displayValue = field.format 
                  ? field.format(value, row) 
                  : (value !== undefined && value !== null ? String(value) : '');

                return (
                  <td key={field.key} style={{ padding: '8px', border: '1px solid #ccc' }}>
                    {isEditing && field.editable !== false && row[field.key] !== undefined ? (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        step={field.type === 'number' ? '0.01' : undefined}
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        style={{ width: '100%', padding: '4px' }}
                        autoFocus
                      />
                    ) : (
                      displayValue
                    )}
                  </td>
                );
              })}
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                {editing?.id === rowId ? (
                  <div>
                    <button onClick={handleSave} disabled={saving} style={{ marginRight: '4px', padding: '4px 8px' }}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={handleCancel} style={{ padding: '4px 8px' }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  fields
                    .filter((f) => f.editable !== false && f.type !== 'readonly' && row[f.key] !== undefined)
                    .map((field) => (
                      <button
                        key={field.key}
                        onClick={() => handleEdit(rowId, field.key, row[field.key])}
                        style={{ marginRight: '4px', padding: '4px 8px', fontSize: '12px' }}
                      >
                        Edit {field.label}
                      </button>
                    ))
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default LowCodeCRUD;
