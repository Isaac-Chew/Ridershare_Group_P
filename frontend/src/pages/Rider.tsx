import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TripForm from '../components/TripForm';
import TripsTable from '../components/TripsTable';
import { Trip } from '../types';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const RiderPage: React.FC = () => {
  const { email, isRider, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  // Trip-related state
  const [showTripForm, setShowTripForm] = useState(false);
  const [requestedTrips, setRequestedTrips] = useState<Trip[]>([]);
  const [isLoadingRequestedTrips, setIsLoadingRequestedTrips] = useState(false);
  const [rideHistory, setRideHistory] = useState<Trip[]>([]);
  const [isLoadingRideHistory, setIsLoadingRideHistory] = useState(false);

  const fetchRequestedTrips = async () => {
    if (!email) return;
    
    setIsLoadingRequestedTrips(true);
    setError(null);
    try {
      // Fetch trips by status (similar to Driver page)
      const response = await fetch(`${API_BASE_URL}/api/trip/status/Requested`);
      if (!response.ok) {
        throw new Error('Failed to fetch requested trips');
      }
      const data = await response.json();
      // Filter to only show trips for the current rider
      const filteredTrips = (data.trips || []).filter(
        (trip: Trip) => trip.RiderID && trip.RiderID.toLowerCase() === email.toLowerCase()
      );
      setRequestedTrips(filteredTrips);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching requested trips:', err);
    } finally {
      setIsLoadingRequestedTrips(false);
    }
  };

  const fetchRideHistory = async () => {
    if (!email) return;
    
    setIsLoadingRideHistory(true);
    setError(null);
    try {
      // Fetch trips by status (similar to Driver page)
      // Get both InProgress and Completed trips, then filter by rider email
      const [inProgressResponse, completedResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/trip/status/InProgress`),
        fetch(`${API_BASE_URL}/api/trip/status/Completed`)
      ]);

      if (!inProgressResponse.ok || !completedResponse.ok) {
        throw new Error('Failed to fetch ride history');
      }

      const inProgressData = await inProgressResponse.json();
      const completedData = await completedResponse.json();

      // Combine both arrays and filter by rider email
      const allTrips = [
        ...(inProgressData.trips || []),
        ...(completedData.trips || [])
      ];

      // Filter to only show trips for the current rider
      const filteredTrips = allTrips.filter(
        (trip: Trip) => trip.RiderID && trip.RiderID.toLowerCase() === email.toLowerCase()
      );

      setRideHistory(filteredTrips);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
      console.error('Error fetching ride history:', err);
    } finally {
      setIsLoadingRideHistory(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isRider) {
      fetchRequestedTrips();
      fetchRideHistory();
    }
  }, [authLoading, isRider, email]);

  // Handle trip form submission (after AI has already estimated)
  const handleTripSubmit = async (tripData: Partial<Trip>) => {
    if (!email) {
      setError('Rider email not found');
      return;
    }

    try {
      setError(null);
      
      // At this point, EstimatedTime and Fare should already be set by AI
      const payload = {
        PickUpLocation: String(tripData.PickUpLocation).trim(),
        DropOffLocation: String(tripData.DropOffLocation).trim(),
        EstimatedTime: Number(tripData.EstimatedTime || 0),
        Fare: Number(tripData.Fare || 0),
        Tip: Number(tripData.Tip || 0),
        RiderID: String(email).trim(),
        DriverID: tripData.DriverID || null,
        RideStatus: 'Requested',
      };

      console.log('Submitting final trip with payload:', payload);

      const response = await fetch(`${API_BASE_URL}/api/trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create trip (${response.status})`);
      }

      console.log('Trip created successfully');

      // Close form and refresh trips
      setShowTripForm(false);
      await fetchRequestedTrips();
    } catch (err) {
      console.error('Error creating trip:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the trip';
      setError(errorMessage);
    }
  };

  // Handle locations submitted - calls AI then updates trip
  const handleLocationsSubmitted = async (rideId: number, pickup: string, dropoff: string) => {
    try {
      // Call AI to get estimated time
      const estimatedTime = await estimateTravelTime(pickup, dropoff);
      
      // Calculate fare based on estimated time (EstimatedTime * 0.8)
      const fare = Number((estimatedTime * 0.8).toFixed(2));
      
      // Update trip with AI estimates
      const updatePayload = {
        EstimatedTime: estimatedTime,
        Fare: fare,
        RideStatus: 'Requested',
      };

      const updateResponse = await fetch(`${API_BASE_URL}/api/trip/${rideId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update trip with estimates');
      }

      console.log('Trip updated with AI estimates');
      await fetchRequestedTrips();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to estimate travel time');
      console.error('Error in handleLocationsSubmitted:', err);
    }
  };

  // AI function to estimate travel time
  const estimateTravelTime = async (pickup: string, dropoff: string): Promise<number> => {
    try {
      const endpoint = import.meta.env.VITE_PROJECT_ENDPOINT as string;
      const apiKey = import.meta.env.VITE_AZURE_API_KEY as string;
      const deployment = import.meta.env.VITE_MODEL_DEPLOYMENT_NAME ?? "gpt-4o";

      const credential = {
        getToken: async () => ({
          token: apiKey,
          expiresOnTimestamp: Date.now() + 3600000,
        }),
      };

      const { AIProjectClient } = await import("@azure/ai-projects");
      const project = new AIProjectClient(endpoint, credential);
      const client = await project.getAzureOpenAIClient({
        apiVersion: "2024-12-01-preview",
      });

      const prompt = `
        Estimate travel time between:
        Pickup: ${pickup}
        Dropoff: ${dropoff}

        Rules:
        - Return ONLY a number in minutes. No text.
        - If unsure, guess a reasonable number between 5–25.
      `;

      const result = await client.chat.completions.create({
        model: deployment,
        messages: [
          { role: "system", content: "Return only a number." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 10,
      });

      const output = String(result.choices?.[0]?.message?.content || "").trim();
      const minutes = Number(output);

      if (!isNaN(minutes) && minutes > 0) {
        return minutes;
      } else {
        // fallback
        return 10 + Math.floor(Math.random() * 10);
      }
    } catch (err) {
      console.error("Travel time AI error:", err);
      return 12 + Math.floor(Math.random() * 8);
    }
  };

  // Handle trip form cancel
  const handleTripCancel = () => {
    setShowTripForm(false);
  };


  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
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
      <Navbar userType="rider" />

      <div style={contentStyle}>
        {error && <div style={errorStyle}>{error}</div>}

        {showTripForm ? (
          email ? (
            <TripForm
              trip={null}
              riderId={email}
              onSubmit={handleTripSubmit}
              onCancel={handleTripCancel}
              onLocationsSubmitted={handleLocationsSubmitted}
            />
          ) : (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: '#64748b',
              fontSize: '16px' 
            }}>
              Loading rider information...
            </div>
          )
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
              <>
                <div style={{ marginTop: '0' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{ margin: 0, color: '#1f2937', fontWeight: 600 }}>
                      Requested Rides
                    </h3>
                    <button 
                      onClick={() => setShowTripForm(true)} 
                      style={buttonStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                      }}
                    >
                      Request a New Ride
                    </button>
                  </div>
                  <TripsTable
                    data={requestedTrips}
                    isLoading={isLoadingRequestedTrips}
                  />
                </div>
                
                <div style={{ marginTop: '40px' }}>
                  <h3 style={{ marginBottom: '20px', color: '#1f2937', fontWeight: 600 }}>
                    Ride History
                  </h3>
                  <TripsTable
                    data={rideHistory}
                    isLoading={isLoadingRideHistory}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RiderPage;

