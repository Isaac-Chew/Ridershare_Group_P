import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LowCodeCRUD from '../components/LowCodeCRUD';
import { Trip } from '../types';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const RiderPayments: React.FC = () => {
  const { email, isRider, isLoading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/trip/status/Completed`);
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      const data = await response.json();
      
      const filteredTrips = (data.trips || []).filter(
        (trip: Trip) => trip.RiderID && trip.RiderID.toLowerCase() === email.toLowerCase()
      );
      
      setTrips(filteredTrips);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching trips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isRider) {
      fetchTrips();
    }
  }, [authLoading, isRider, email]);

  const handleUpdate = async (rideId: number, field: string, value: any) => {
    try {
      setError(null);
      const updateData: any = { [field]: field === 'Tip' ? parseFloat(value) : value };
      
      const response = await fetch(`${API_BASE_URL}/api/trip/${rideId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update (${response.status})`);
      }

      await fetchTrips();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    }
  };

  const fields = [
    { key: 'RideID', label: 'Ride ID', type: 'readonly' as const },
    { key: 'PickUpLocation', label: 'Pick Up', type: 'readonly' as const },
    { key: 'DropOffLocation', label: 'Drop Off', type: 'readonly' as const },
    { 
      key: 'Fare', 
      label: 'Fare', 
      type: 'readonly' as const,
      format: (v: number) => `$${Number(v || 0).toFixed(2)}`
    },
    { 
      key: 'Tip', 
      label: 'Tip', 
      type: 'number' as const,
      editable: true,
      format: (v: number) => `$${Number(v || 0).toFixed(2)}`
    },
    {
      key: 'Total',
      label: 'Total',
      type: 'readonly' as const,
      format: (_v: any, row: Trip) => `$${(Number(row.Fare) + Number(row.Tip)).toFixed(2)}`
    },
    {
      key: 'createdAt',
      label: 'Date',
      type: 'readonly' as const,
      format: (v: string) => v ? new Date(v).toLocaleDateString() : 'N/A'
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navbar userType="rider" />
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {error && (
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: '#fee2e2', 
            color: '#991b1b', 
            marginBottom: '20px',
            borderRadius: '8px'
          }}>
            {error}
          </div>
        )}

        {!isRider ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            You do not have permission to view this page. Rider role required.
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '20px' }}>Payments - Edit Tips</h2>
            <p style={{ marginBottom: '24px', color: '#64748b' }}>
              View and edit tips for your completed rides.
            </p>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px' }}>
              <LowCodeCRUD
                data={trips}
                fields={fields}
                onUpdate={handleUpdate}
                idField="RideID"
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RiderPayments;
