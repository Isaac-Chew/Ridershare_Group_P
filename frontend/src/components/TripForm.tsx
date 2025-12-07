import React, { useEffect, useState } from 'react';
import { Trip } from '../types';

interface TripFormProps {
  trip?: Partial<Trip> | null;
  riderId: string; // RiderID (email) passed via prop or context upstream
  onSubmit: (data: Partial<Trip>) => void;
  onCancel: () => void;
}

const TripForm: React.FC<TripFormProps> = ({ trip, riderId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Trip>>({
    PickUpLocation: '',
    DropOffLocation: '',
    EstimatedTime: 0,
    Fare: 0,
    Tip: 0,
    RiderID: riderId,
  });

  const [errors, setErrors] = useState<Partial<Record<'PickUpLocation' | 'DropOffLocation' | 'EstimatedTime' | 'Fare' | 'Tip', string>>>({});

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      PickUpLocation: (trip?.PickUpLocation ?? '').toString(),
      DropOffLocation: (trip?.DropOffLocation ?? '').toString(),
      EstimatedTime: typeof trip?.EstimatedTime === 'number' ? trip!.EstimatedTime : Number(trip?.EstimatedTime ?? 0),
      Fare: typeof trip?.Fare === 'number' ? trip!.Fare : Number(trip?.Fare ?? 0),
      Tip: typeof trip?.Tip === 'number' ? trip!.Tip : Number(trip?.Tip ?? 0),
      RiderID: riderId,
      DriverID: trip?.DriverID ?? null,
      // RideStatus is always set to 'Requested' by the backend for new trips
    }));
  }, [trip, riderId]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<'PickUpLocation' | 'DropOffLocation' | 'EstimatedTime' | 'Fare' | 'Tip', string>> = {};

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
    
    // Ensure RiderID is set from riderId prop (which should be the email)
    if (!riderId || riderId.trim() === '') {
      setErrors({ PickUpLocation: 'Rider ID is required. Please refresh the page.' });
      return;
    }

    if (!validate()) return;

    const payload: Partial<Trip> = {
      PickUpLocation: String(formData.PickUpLocation || '').trim(),
      DropOffLocation: String(formData.DropOffLocation || '').trim(),
      EstimatedTime: Number(formData.EstimatedTime || 0),
      Fare: Number(formData.Fare || 0),
      Tip: Number(formData.Tip || 0),
      RiderID: riderId.trim(),
      DriverID: formData.DriverID ?? null,
      // RideStatus is always set to 'Requested' by the backend for new trips
    };

    // Double-check required fields before submitting
    if (!payload.PickUpLocation || !payload.DropOffLocation || !payload.RiderID) {
      setErrors({ 
        PickUpLocation: !payload.PickUpLocation ? 'Pickup location is required' : undefined,
        DropOffLocation: !payload.DropOffLocation ? 'Dropoff location is required' : undefined
      });
      return;
    }

    onSubmit(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'EstimatedTime' || name === 'Fare' || name === 'Tip' 
        ? (value === '' ? 0 : Number(value)) 
        : value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Shared styling similar to Form.tsx and DriverForm.tsx
  const formStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
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
    boxSizing: 'border-box',
    fontSize: '14px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.outline = 'none';
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
  };

  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.boxShadow = 'none';
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
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#1e3a8a' }}>
        {trip?.RideID ? 'Edit Trip' : 'Request Trip'}
      </h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>
          Pick Up Location <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          name="PickUpLocation"
          value={String(formData.PickUpLocation ?? '')}
          onChange={handleChange}
          style={inputStyle}
          onFocus={inputFocus}
          onBlur={inputBlur}
          placeholder="e.g., 123 Main St"
        />
        {errors.PickUpLocation && <div style={errorStyle}>{errors.PickUpLocation}</div>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>
          Drop Off Location <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          name="DropOffLocation"
          value={String(formData.DropOffLocation ?? '')}
          onChange={handleChange}
          style={inputStyle}
          onFocus={inputFocus}
          onBlur={inputBlur}
          placeholder="e.g., 456 Market St"
        />
        {errors.DropOffLocation && <div style={errorStyle}>{errors.DropOffLocation}</div>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Estimated Time (minutes)</label>
        <input
          type="number"
          name="EstimatedTime"
          value={Number(formData.EstimatedTime ?? 0)}
          onChange={handleChange}
          style={inputStyle}
          onFocus={inputFocus}
          onBlur={inputBlur}
          min={0}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Fare ($)</label>
          <input
            type="number"
            step="0.01"
            name="Fare"
            value={Number(formData.Fare ?? 0)}
            onChange={handleChange}
            style={inputStyle}
            onFocus={inputFocus}
            onBlur={inputBlur}
            min={0}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Tip ($)</label>
          <input
            type="number"
            step="0.01"
            name="Tip"
            value={Number(formData.Tip ?? 0)}
            onChange={handleChange}
            style={inputStyle}
            onFocus={inputFocus}
            onBlur={inputBlur}
            min={0}
          />
        </div>
      </div>

      <div style={buttonContainerStyle}>
        <button
          type="button"
          onClick={onCancel}
          style={{ ...buttonStyle, backgroundColor: '#e5e7eb', color: '#111827' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d1d5db')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{ ...buttonStyle, backgroundColor: '#3b82f6', color: 'white' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
        >
          {trip?.RideID ? 'Save Changes' : 'Request Trip'}
        </button>
      </div>
    </form>
  );
};

export default TripForm;
