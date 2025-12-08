import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import TripsTable from '../components/TripsTable';
import { Trip } from '../types';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const DriverPage: React.FC = () => {
  const { email, isDriver, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  // Trips state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  
  // Ride History state
  const [rideHistory, setRideHistory] = useState<Trip[]>([]);
  const [isLoadingRideHistory, setIsLoadingRideHistory] = useState(false);

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

  const fetchRideHistory = async () => {
    if (!email) return;
    
    setIsLoadingRideHistory(true);
    setError(null);
    try {
      // Fetch trips by status (similar to fetchRequestedTrips)
      // Get both InProgress and Completed trips, then filter by driver email
      const [inProgressResponse, completedResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/trip/status/InProgress`),
        fetch(`${API_BASE_URL}/api/trip/status/Completed`)
      ]);

      if (!inProgressResponse.ok || !completedResponse.ok) {
        throw new Error('Failed to fetch ride history');
      }

      const inProgressData = await inProgressResponse.json();
      const completedData = await completedResponse.json();

      // Combine both arrays and filter by driver email
      const allTrips = [
        ...(inProgressData.trips || []),
        ...(completedData.trips || [])
      ];

      // Filter to only show trips for the current driver
      const filteredTrips = allTrips.filter(
        (trip: Trip) => trip.DriverID && trip.DriverID.toLowerCase() === email.toLowerCase()
      );

      setRideHistory(filteredTrips);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching ride history:', err);
    } finally {
      setIsLoadingRideHistory(false);
    }
  };

  const handleAcceptTrip = async (trip: Trip) => {
    if (!window.confirm(`Accept this ride from ${trip.PickUpLocation} to ${trip.DropOffLocation}?`)) {
      return;
    }
    
    try {
      setError(null);
      if (!email) {
        throw new Error('Driver email not found');
      }

      const response = await fetch(`${API_BASE_URL}/api/trip/${trip.RideID}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          DriverID: email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept trip');
      }

      // Refresh the trips list to remove the accepted trip
      await fetchRequestedTrips();
      // Refresh ride history to show the newly accepted trip
      await fetchRideHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error accepting trip:', err);
    }
  };

  const handleMarkDone = async (trip: Trip) => {
    if (!window.confirm(`Mark this ride from ${trip.PickUpLocation} to ${trip.DropOffLocation} as completed?`)) {
      return;
    }
    
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/trip/${trip.RideID}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark trip as completed');
      }

      // Refresh the ride history to show updated status
      await fetchRideHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error marking trip as done:', err);
    }
  };

  useEffect(() => {
    if (!authLoading && isDriver) {
      fetchRequestedTrips();
      fetchRideHistory();
    }
  }, [authLoading, isDriver, email]);

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
            <div style={{ marginTop: '0' }}>
              <h3 style={{ marginBottom: '20px', color: '#1f2937', fontWeight: 600 }}>
                Available Rides (Requested)
              </h3>
              <TripsTable
                data={trips}
                isLoading={isLoadingTrips}
                onAccept={handleAcceptTrip}
                disableAccept={rideHistory.some(trip => trip.RideStatus === 'InProgress')}
              />
            </div>
            
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ marginBottom: '20px', color: '#1f2937', fontWeight: 600 }}>
                Ride History
              </h3>
              <TripsTable
                data={rideHistory}
                isLoading={isLoadingRideHistory}
                onMarkDone={handleMarkDone}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DriverPage;
