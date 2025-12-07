import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Form from '../components/Form';
import Logo from '../components/Logo';
import { Rider, RiderFormData } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useAuthContext } from '@asgardeo/auth-react';
const { signOut } = useAuthContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const RiderPage: React.FC = () => {
  const { email, isRider, isLoading: authLoading } = useAuth();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
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
  }, [authLoading, isRider]);

  // Handle form submission (create or update)
  const handleFormSubmit = async (formData: RiderFormData) => {
    try {
      setError(null);
      if (editingRider) {
        // Update existing rider
        const response = await fetch(`${API_BASE_URL}/api/riders/${editingRider.RiderID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update rider');
        }

        // Close form and return to table view immediately
        setShowForm(false);
        setEditingRider(null);
        
        // Refresh the list to show updated data
        fetchRiders().catch(err => {
          console.error('Error refreshing riders list:', err);
        });
      } else {
        // Create new rider
        const response = await fetch(`${API_BASE_URL}/api/riders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create rider');
        }

        // Close form and return to table view immediately
        setShowForm(false);
        setEditingRider(null);
        
        // Refresh the list to show new rider
        fetchRiders().catch(err => {
          console.error('Error refreshing riders list:', err);
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error saving rider:', err);
    }
  };

  // Handle edit button click
  const handleEdit = (rider: Rider) => {
    setEditingRider(rider);
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = async (rider: Rider) => {
    if (!window.confirm(`Are you sure you want to delete ${rider.FirstName} ${rider.LastName}?`)) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/riders/${rider.RiderID}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete rider');
      }

      // Refresh the list
      await fetchRiders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting rider:', err);
    }
  };

  // Handle add button click
  const handleAdd = () => {
    setEditingRider(null);
    setShowForm(true);
  };

  // Handle form cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingRider(null);
  };

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
          <h2 style={{ margin: 0, color: '#1f2937', fontWeight: 600 }}>Riders Management</h2>
        </div>
        {!showForm && (
          <button 
            onClick={handleAdd} 
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            Add New Rider
          </button>
        )}
      </div>

      <button onClick={() => signOut()}>Sign out</button>

      <div style={contentStyle}>
        {error && <div style={errorStyle}>{error}</div>}

        {showForm ? (
          <Form
            rider={editingRider}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <>
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
              <Table
                data={filteredRiders}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading || authLoading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RiderPage;

