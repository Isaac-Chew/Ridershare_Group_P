import React, { useEffect, useState } from 'react';
import { Trip } from '../types';
import TripTimeEstimator from "../components/TripTimeEstimator";
import TipEstimator from "./TipEstimator";

interface TripFormProps {
  trip?: Partial<Trip> | null;
  riderId: string;
  onSubmit: (data: Partial<Trip>) => void;
  onCancel: () => void;
  onLocationsSubmitted?: (rideId: number, pickup: string, dropoff: string) => void;
}

const TripForm: React.FC<TripFormProps> = ({ trip, riderId, onSubmit, onCancel, onLocationsSubmitted }) => {

  const [formData, setFormData] = useState<Partial<Trip>>({
    PickUpLocation: '',
    DropOffLocation: '',
    EstimatedTime: 8,
    Fare: 19,
    Tip: 0,
    RiderID: riderId,
  });

  const [locationsSubmitted, setLocationsSubmitted] = useState(false);
  const [submittedRideId, setSubmittedRideId] = useState<number | null>(null);
  const [tipInputValue, setTipInputValue] = useState<string>('');
  const [errors, setErrors] = useState<Partial<Record<'PickUpLocation' | 'DropOffLocation' | 'EstimatedTime' | 'Fare' | 'Tip', string>>>({});

  useEffect(() => {
    const tipValue =
      trip?.Tip !== undefined && trip?.Tip !== null ? Number(trip.Tip) : 0;

    setFormData((prev) => ({
      ...prev,
      PickUpLocation: (trip?.PickUpLocation ?? '').toString(),
      DropOffLocation: (trip?.DropOffLocation ?? '').toString(),
      EstimatedTime: trip?.RideID
        ? (typeof trip?.EstimatedTime === 'number'
          ? trip.EstimatedTime
          : Number(trip?.EstimatedTime ?? 8))
        : 8,
      Fare: trip?.RideID
        ? (typeof trip?.Fare === 'number' ? trip.Fare : Number(trip?.Fare ?? 19))
        : 19,
      Tip: tipValue,
      RiderID: riderId,
      DriverID: trip?.DriverID ?? null,
    }));

    setTipInputValue(tipValue === 0 ? '' : String(tipValue));
  }, [trip, riderId]);

  const validate = (): boolean => {
    const newErrors: any = {};

    if (!formData.PickUpLocation || !String(formData.PickUpLocation).trim()) {
      newErrors.PickUpLocation = 'Pickup location is required';
    }
    if (!formData.DropOffLocation || !String(formData.DropOffLocation).trim()) {
      newErrors.DropOffLocation = 'Dropoff location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!riderId || riderId.trim() === '') {
      setErrors({ PickUpLocation: 'Rider ID is required. Please refresh the page.' });
      return;
    }

    if (!validate()) return;

    const payload: Partial<Trip> = {
      PickUpLocation: String(formData.PickUpLocation || '').trim(),
      DropOffLocation: String(formData.DropOffLocation || '').trim(),
      EstimatedTime: Number(formData.EstimatedTime || 8),
      Fare: Number(formData.Fare || 19),
      Tip: Number(formData.Tip || 0),
      RiderID: riderId.trim(),
      DriverID: formData.DriverID ?? null,
    };

    if (!payload.PickUpLocation || !payload.DropOffLocation) {
      return;
    }

    onSubmit(payload);
  };

  const handleSubmitLocations = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!riderId || riderId.trim() === '') {
      setErrors({ PickUpLocation: 'Rider ID is required. Please refresh the page.' });
      return;
    }

    if (!validate()) return;

    const payload: Partial<Trip> = {
      PickUpLocation: String(formData.PickUpLocation || '').trim(),
      DropOffLocation: String(formData.DropOffLocation || '').trim(),
      RiderID: riderId.trim(),
    };

    if (!payload.PickUpLocation || !payload.DropOffLocation) {
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit locations');
      }

      const result = await response.json();
      const rideId = result.trip?.RideID;

      if (rideId && onLocationsSubmitted) {
        setSubmittedRideId(rideId);
        setLocationsSubmitted(true);
        onLocationsSubmitted(rideId, payload.PickUpLocation as string, payload.DropOffLocation as string);
      }
    } catch (err) {
      setErrors({ PickUpLocation: err instanceof Error ? err.message : 'Failed to submit locations' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'Tip') {
      setTipInputValue(value);
      setFormData((prev) => ({
        ...prev,
        Tip: value === '' ? 0 : Number(value),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'EstimatedTime' || name === 'Fare'
          ? (value === '' ? (name === 'EstimatedTime' ? 8 : 19) : Number(value))
          : value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // styles
  const formStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#1f2937',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    marginTop: '4px',
    marginBottom: '4px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
  };

  const readOnlyInputStyle: React.CSSProperties = {
    ...inputStyle,
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    cursor: 'not-allowed',
  };

  const errorStyle: React.CSSProperties = {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
    marginBottom: '12px',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
    border: 'none',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={{ margin: 0, marginBottom: '24px', color: '#1e3a8a' }}>
        {trip?.RideID ? 'Edit Trip' : 'Request Trip'}
      </h2>

      {/* PICKUP */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>
          Pick Up Location <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          name="PickUpLocation"
          value={String(formData.PickUpLocation ?? '')}
          onChange={handleChange}
          disabled={locationsSubmitted}
          style={locationsSubmitted ? readOnlyInputStyle : inputStyle}
          placeholder="e.g., 123 Main St"
        />
        {errors.PickUpLocation && <div style={errorStyle}>{errors.PickUpLocation}</div>}
      </div>

      {/* DROPOFF */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>
          Drop Off Location <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          name="DropOffLocation"
          value={String(formData.DropOffLocation ?? '')}
          onChange={handleChange}
          disabled={locationsSubmitted}
          style={locationsSubmitted ? readOnlyInputStyle : inputStyle}
          placeholder="e.g., 456 Market St"
        />
        {errors.DropOffLocation && <div style={errorStyle}>{errors.DropOffLocation}</div>}
      </div>

      {/* SUBMIT LOCATIONS BUTTON (only shows before locations submitted) */}
      {!locationsSubmitted && (
        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            onClick={handleSubmitLocations}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 500,
            }}
          >
            Submit Locations
          </button>
        </div>
      )}

      {/* AI-POWERED ESTIMATED TIME - only show after locations submitted */}
      {locationsSubmitted && (
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Estimated Time (minutes)</label>

          <input
            type="number"
            name="EstimatedTime"
            value={Number(formData.EstimatedTime ?? 8)}
            readOnly
            style={readOnlyInputStyle}
          />

          <TripTimeEstimator
            pickup={String(formData.PickUpLocation || "")}
            dropoff={String(formData.DropOffLocation || "")}
            onEstimate={(minutes) =>
              setFormData((prev) => ({
                ...prev,
                EstimatedTime: minutes,
                Fare: Number((minutes * 0.8).toFixed(2)),
              }))
            }
          />
        </div>
      )}

      {/* FARE + TIP - only show after locations submitted */}
      {locationsSubmitted && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Fare ($)</label>
            <input
              type="number"
              step="0.01"
              name="Fare"
              value={Number(formData.Fare ?? 19)}
              readOnly
              style={readOnlyInputStyle}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Tip ($)</label>
            <input
              type="number"
              step="0.01"
              name="Tip"
              value={tipInputValue}
              onChange={handleChange}
              style={inputStyle}
              min={0}
            />

            <TipEstimator
              fare={Number(formData.Fare ?? 19)}
              estimatedTime={Number(formData.EstimatedTime ?? 8)}
              onEstimate={(tip) => {
                const formatted = tip.toFixed(2);
                setTipInputValue(formatted);
                setFormData((prev) => ({
                  ...prev,
                  Tip: tip,
                }));
              }}
            />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={buttonContainerStyle}>
        <button
          type="button"
          onClick={onCancel}
          style={{ ...buttonStyle, backgroundColor: '#e5e7eb', color: '#111827' }}
        >
          Cancel
        </button>

        {locationsSubmitted && (
          <button
            type="submit"
            style={{ ...buttonStyle, backgroundColor: '#3b82f6', color: 'white' }}
          >
            {trip?.RideID ? 'Save Changes' : 'Request Trip'}
          </button>
        )}
      </div>
    </form>
  );
};

export default TripForm;
