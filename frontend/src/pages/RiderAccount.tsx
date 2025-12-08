import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import { Rider } from '../types';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const RiderAccount: React.FC = () => {
  const { email, isRider, isLoading: authLoading } = useAuth();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter riders to only show those matching the current user's email
  const filteredRiders = email 
    ? riders.filter(rider => rider.Email.toLowerCase() === email.toLowerCase())
    : [];

  // Fetch all riders
  const fetchRiders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/riders`);
      if (!response.ok) {
        throw new Error('Failed to fetch riders');
      }
      const data = await response.json();
      setRiders(data.riders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching riders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isRider) {
      fetchRiders();
    }
  }, [authLoading, isRider, email]);

  // Define table columns
  const columns = [
    { key: 'RiderID' as keyof Rider, label: 'ID' },
    { key: 'FirstName' as keyof Rider, label: 'First Name' },
    { key: 'LastName' as keyof Rider, label: 'Last Name' },
    {
      key: 'DateOfBirth' as keyof Rider,
      label: 'Date of Birth',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {key: 'signup_date' as keyof Rider, label: 'Signup Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'rider_status' as keyof Rider,
      label: 'Rider Status',
      render: (value: string) => (
        <span 
          style={{ 
            color: value === 'Active' ? '#3b82f6' : '#64748b',
            fontWeight: value === 'on' ? 500 : 400,
          }}
        >
          {value === 'Active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { key: 'PhoneNumber' as keyof Rider, label: 'Phone' },
    { key: 'Email' as keyof Rider, label: 'Email' },
    { key: 'City' as keyof Rider, label: 'City' },
    { key: 'State' as keyof Rider, label: 'State' },
    {
      key: 'LocationStatus' as keyof Rider,
      label: 'Location',
      render: (value: string) => (
        <span 
          style={{ 
            color: value === 'on' ? '#3b82f6' : '#64748b',
            fontWeight: value === 'on' ? 500 : 400,
          }}
        >
          {value === 'on' ? 'On' : 'Off'}
        </span>
      ),
    },
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
      <Navbar userType="rider" />
      <div style={contentStyle}>
        {error && <div style={errorStyle}>{error}</div>}

        {!isRider ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#64748b',
            fontSize: '16px' 
          }}>
            You do not have permission to view this page. Rider role required.
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '20px', color: '#1f2937', fontWeight: 600 }}>
              Account Information
            </h2>
            <Table
              data={filteredRiders}
              columns={columns}
              isLoading={isLoading || authLoading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default RiderAccount;
