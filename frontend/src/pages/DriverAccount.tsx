import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import DriverForm from '../components/DriverForm';
import { Driver, DriverFormData } from '../types';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const DriverAccount: React.FC = () => {
  const { email, isDriver, isLoading: authLoading } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
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

  const handleFormSubmit = async (formData: DriverFormData) => {
    try {
      setError(null);
      if (editingDriver) {
        // Update existing driver
        const response = await fetch(`${API_BASE_URL}/api/driver/${editingDriver.DriverID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          let errorMessage = 'Failed to update driver';
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } else {
              errorMessage = `Server error: ${response.status} ${response.statusText}`;
            }
          } catch (parseError) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        // Close form and return to table view immediately
        setShowForm(false);
        setEditingDriver(null);
        
        // Refresh the list to show updated data
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
      const response = await fetch(`${API_BASE_URL}/api/driver/${driver.DriverID}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete driver';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } catch (parseError) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Refresh the list
      await fetchDrivers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting driver:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDriver(null);
  };

  const currentDriver = filteredDrivers[0];

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

        {showForm ? (
          <DriverForm
            driver={editingDriver}
            onSubmit={handleFormSubmit}
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
              <>
                <h2 style={{ marginBottom: '20px', color: '#1f2937', fontWeight: 600 }}>
                  Account Information
                </h2>
                
                {isLoading || authLoading ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#64748b',
                    fontSize: '16px' 
                  }}>
                    Loading...
                  </div>
                ) : currentDriver ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Personal Information Card */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      padding: '24px',
                    }}>
                      <h3 style={{ 
                        marginBottom: '20px', 
                        color: '#1f2937', 
                        fontWeight: 600,
                        fontSize: '18px',
                        borderBottom: '2px solid #e5e7eb',
                        paddingBottom: '12px'
                      }}>
                        Personal Information
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Driver ID</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.DriverID || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>First Name</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.FirstName || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Name</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.LastName || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date of Birth</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>
                            {currentDriver.DateOfBirth ? new Date(currentDriver.DateOfBirth).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.PhoneNumber || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.Email || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Street Address</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.StreetAddress || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.City || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>State</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.State || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zip Code</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.ZipCode || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
                          <div style={{ 
                            color: currentDriver.Status === 'Active' ? '#3b82f6' : '#64748b',
                            fontSize: '14px',
                            fontWeight: currentDriver.Status === 'Active' ? 500 : 400
                          }}>
                            {currentDriver.Status || 'Unknown'}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>License Number</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.LicenseNumber || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Insurance ID</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.InsuranceID || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bank ID</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.BankID || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vehicle ID</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.VehicleID || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Information Card */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      padding: '24px',
                    }}>
                      <h3 style={{ 
                        marginBottom: '20px', 
                        color: '#1f2937', 
                        fontWeight: 600,
                        fontSize: '18px',
                        borderBottom: '2px solid #e5e7eb',
                        paddingBottom: '12px'
                      }}>
                        Vehicle Information
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Make</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.VehicleMake || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.VehicleModel || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.VehicleColor || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>License Plate</div>
                          <div style={{ color: '#1f2937', fontSize: '14px' }}>{currentDriver.VehicleLicensePlate || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end',
                      paddingTop: '8px'
                    }}>
                      <button
                        onClick={() => handleEdit(currentDriver)}
                        style={{
                          padding: '10px 20px',
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
                      <button
                        onClick={() => handleDelete(currentDriver)}
                        style={{
                          padding: '10px 20px',
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
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: '#64748b',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  }}>
                    No driver information found.
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DriverAccount;
