import React, { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import DriverTable from '../components/DriverTable';
import TripsTable from '../components/TripsTable';
import Form from '../components/Form';
import { Driver, DriverFormData, Trip } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useAuthContext } from '@asgardeo/auth-react';
const { signOut } = useAuthContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const DriverPage: React.FC = () => {
  const { email, isDriver, isLoading: authLoading } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Trips state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  
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

  const fetchRequestedTrips = async () => {
    setIsLoadingTrips(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/trip/status/Requested`);
      if (!response.ok) {
        throw new Error('Failed to fetch requested trips');
      }
      const data = await response.json();
      setTrips(data.trips || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching requested trips:', err);
    } finally {
      setIsLoadingTrips(false);
    }
  };

  const handleAcceptTrip = async (trip: Trip) => {
    if (!window.confirm(`Accept this ride from ${trip.PickUpLocation} to ${trip.DropOffLocation}?`)) {
      return;
    }
    
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/trips/${trip.RideID}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          DriverID: filteredDrivers[0]?.DriverID || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept trip');
      }

      // Refresh the trips list to remove the accepted trip
      await fetchRequestedTrips();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error accepting trip:', err);
    }
  };

  useEffect(() => {
    if (!authLoading && isDriver) {
      fetchDrivers();
      fetchRequestedTrips();
    }
  }, [authLoading, isDriver]);

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

      <button onClick={() => signOut()}>Sign out</button>


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
          <>
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
              <DriverTable
                data={filteredDrivers}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading || authLoading}
              />
            )}
            
            {isDriver && (
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ marginBottom: '20px', color: '#1f2937', fontWeight: 600 }}>
                  Available Rides (Requested)
                </h3>
                <TripsTable
                  data={trips}
                  isLoading={isLoadingTrips}
                  onAccept={handleAcceptTrip}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DriverPage;
