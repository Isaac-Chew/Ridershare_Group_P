import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import DriverTable from '../components/DriverTable';
import { Driver } from '../types';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const DriverAccount: React.FC = () => {
  const { email, isDriver, isLoading: authLoading } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter drivers to only show those matching the current user's email
  const filteredDrivers = email 
    ? drivers.filter(driver => driver.Email.toLowerCase() === email.toLowerCase())
    : [];

  const fetchDrivers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/driver`);
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
    if (!authLoading && isDriver) {
      fetchDrivers();
    }
  }, [authLoading, isDriver, email]);

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

  const contentStyle: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
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
      <Navbar userType="driver" />
      <div style={contentStyle}>
        {error && <div style={errorStyle}>{error}</div>}

        {!isDriver ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#64748b',
            fontSize: '16px' 
          }}>
            You do not have permission to view this page. Driver role required.
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '20px', color: '#1f2937', fontWeight: 600 }}>
              Account Information
            </h2>
            <DriverTable
              data={filteredDrivers}
              columns={columns}
              isLoading={isLoading || authLoading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DriverAccount;
