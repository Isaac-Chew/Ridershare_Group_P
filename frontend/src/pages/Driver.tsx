import React, { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import DriverTable from '../components/DriverTable';
import Form from '../components/Form';
import { Driver, DriverFormData } from '../types';

// Use relative URL in development to leverage Vite proxy, or env variable in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const DriverPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers`);
      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }
      const data = await response.json();
      setDrivers(data.drivers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching drivers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleFormSubmit = async (formData: DriverFormData) => {
    try {
      setError(null);
      if (editingDriver) {
        // Update existing driver
        const response = await fetch(`${API_BASE_URL}/api/drivers/${editingDriver.DriverID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update driver');
        }

        // Close form and return to table view immediately
        setShowForm(false);
        setEditingDriver(null);
        
        // Refresh the list to show updated data
        fetchDrivers().catch(err => {
          console.error('Error refreshing drivers list:', err);
        });
      } else {
        // Create new driver
        const response = await fetch(`${API_BASE_URL}/api/drivers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create driver');
        }

        // Close form and return to table view immediately
        setShowForm(false);
        setEditingDriver(null);
        
        // Refresh the list to show new driver
        fetchDrivers().catch(err => {
          console.error('Error refreshing drivers list:', err);
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error saving driver:', err);
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setShowForm(true);
  };

  const handleDelete = async (driver: Driver) => {
    if (!window.confirm(`Are you sure you want to delete ${driver.FirstName} ${driver.LastName}?`)) {
      return;
    }
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/drivers/${driver.DriverID}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete driver');
      }

      // Refresh the list
      await fetchDrivers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting driver:', err);
    }
  };

  const handleAdd = () => {
    setEditingDriver(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDriver(null);
  };

  const columns = [
    { key: 'DriverID' as keyof Driver, label: 'ID' },
    { key: 'FirstName' as keyof Driver, label: 'First Name' },
    { key: 'LastName' as keyof Driver, label: 'Last Name' },
    { key: 'DateOfBirth' as keyof Driver, label: 'Date of Birth', render: (value: string) => new Date(value).toLocaleDateString() },
    { key: 'PhoneNumber' as keyof Driver, label: 'Phone' },
    { key: 'Email' as keyof Driver, label: 'Email' },
    { key: 'City' as keyof Driver, label: 'City' },
    { key: 'State' as keyof Driver, label: 'State' },
    { key: 'Status' as keyof Driver, label: 'Status', render: (value: string | null) => (
      <span 
        style={{ 
          color: value === 'Active' ? '#3b82f6' : '#64748b',
          fontWeight: value === 'Active' ? 500 : 400,
        }}
      >
        {value || 'Unknown'}
      </span>
    ) },
    { key: 'LicenseNumber' as keyof Driver, label: 'License #' },
    { key: 'VehicleMake' as keyof Driver, label: 'Vehicle Make' },
    { key: 'VehicleModel' as keyof Driver, label: 'Vehicle Model' },
    { key: 'VehicleColor' as keyof Driver, label: 'Color' },
    { key: 'VehicleLicensePlate' as keyof Driver, label: 'Plate' },
  ];

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    padding: '20px 40px',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
  };

  const titleSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  };

  const errorStyle: React.CSSProperties = {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={titleSectionStyle}>
          <Logo size="medium" showSubtitle={false} />
          <div style={{ height: '32px', width: '1px', backgroundColor: '#e5e7eb' }} />
          <h2 style={{ margin: 0, color: '#1f2937', fontWeight: 600 }}>Drivers Management</h2>
        </div>
        {!showForm && (
          <button 
            onClick={handleAdd} 
            style={buttonStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
          >
            Add New Driver
          </button>
        )}
      </div>

      <div style={contentStyle}>
        {error && <div style={errorStyle}>{error}</div>}

        {showForm ? (
          <Form
            // Reuse the Form component; if needed later, we can split or add driver-specific fields
            rider={editingDriver as any}
            onSubmit={handleFormSubmit as any}
            onCancel={handleCancel}
          />
        ) : (
          <DriverTable
            data={drivers}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default DriverPage;
