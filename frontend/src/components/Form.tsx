import React, { useState, useEffect } from 'react';
import { Rider, RiderFormData } from '../types';

interface FormProps {
  rider?: Rider | null;
  onSubmit: (data: RiderFormData) => void;
  onCancel: () => void;
}

const Form: React.FC<FormProps> = ({ rider, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<RiderFormData>({
    FirstName: '',
    LastName: '',
    DateOfBirth: '',
    signup_date: '',
    rider_status: 'Inactive',
    PhoneNumber: '',
    Email: '',
    StreetAddress: '',
    City: '',
    State: '',
    ZipCode: '',
    LocationStatus: 'off',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RiderFormData, string>>>({});

  useEffect(() => {
    try {
      if (rider) {
        // Safely handle DateOfBirth - it might be null or in different formats
        let dateOfBirth = '';
        try {
          if (rider.DateOfBirth) {
            if (typeof rider.DateOfBirth === 'string') {
              dateOfBirth = rider.DateOfBirth.includes('T') 
                ? rider.DateOfBirth.split('T')[0] 
                : rider.DateOfBirth;
            } else {
              dateOfBirth = String(rider.DateOfBirth);
            }
          }
        } catch (e) {
          dateOfBirth = '';
        }
        
        setFormData({
          FirstName: (rider.FirstName || '').toString(),
          LastName: (rider.LastName || '').toString(),
          DateOfBirth: dateOfBirth,
          signup_date: (rider.signup_date || '').toString(),
          rider_status: (rider.rider_status || 'Inactive') as 'Active' | 'Inactive',
          PhoneNumber: (rider.PhoneNumber || '').toString(),
          Email: (rider.Email || '').toString(),
          StreetAddress: (rider.StreetAddress || '').toString(),
          City: (rider.City || '').toString(),
          State: (rider.State || '').toString(),
          ZipCode: (rider.ZipCode || '').toString(),
          LocationStatus: (rider.LocationStatus || 'off') as 'on' | 'off',
        });
      } else {
        // Reset form when no rider (adding new)
        setFormData({
          FirstName: '',
          LastName: '',
          DateOfBirth: '',
          signup_date: '',
          rider_status: 'Inactive',
          PhoneNumber: '',
          Email: '',
          StreetAddress: '',
          City: '',
          State: '',
          ZipCode: '',
          LocationStatus: 'off',
        });
      }
    } catch (error) {
      // Set empty form on error
      setFormData({
        FirstName: '',
        LastName: '',
        DateOfBirth: '',
        signup_date: '',
        rider_status: 'Inactive',
        PhoneNumber: '',
        Email: '',
        StreetAddress: '',
        City: '',
        State: '',
        ZipCode: '',
        LocationStatus: 'off',
      });
    }
  }, [rider]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RiderFormData, string>> = {};

    if (!formData.FirstName.trim()) {
      newErrors.FirstName = 'First name is required';
    }
    if (!formData.LastName.trim()) {
      newErrors.LastName = 'Last name is required';
    }
    if (!formData.DateOfBirth) {
      newErrors.DateOfBirth = 'Date of birth is required';
    }
    if (!formData.Email.trim()) {
      newErrors.Email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      newErrors.Email = 'Invalid email format';
    }
    if (!formData.StreetAddress.trim()) {
      newErrors.StreetAddress = 'Street address is required';
    }
    if (!formData.City.trim()) {
      newErrors.City = 'City is required';
    }
    if (!formData.State.trim()) {
      newErrors.State = 'State is required';
    }
    if (!formData.ZipCode.trim()) {
      newErrors.ZipCode = 'Zip code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // Don't send signup_date when empty so backend can set the insert timestamp.
      const payload: Partial<RiderFormData> = { ...formData };
      if (!payload.signup_date) {
        delete payload.signup_date;
      }
      // If you instead want the client to set signup_date to today, uncomment:
      // payload.signup_date = payload.signup_date || new Date().toISOString().split('T')[0];

      onSubmit(payload as RiderFormData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof RiderFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

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

  const inputFocusStyle = {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
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
        {rider ? 'Edit Rider' : 'Add New Rider'}
      </h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>
          First Name <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          name="FirstName"
          value={formData.FirstName}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            Object.assign(e.target.style, inputFocusStyle);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        {errors.FirstName && <div style={errorStyle}>{errors.FirstName}</div>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>
          Last Name <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          name="LastName"
          value={formData.LastName}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            Object.assign(e.target.style, inputFocusStyle);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        {errors.LastName && <div style={errorStyle}>{errors.LastName}</div>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>
          Date of Birth <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="date"
          name="DateOfBirth"
          value={formData.DateOfBirth}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            Object.assign(e.target.style, inputFocusStyle);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        {errors.DateOfBirth && <div style={errorStyle}>{errors.DateOfBirth}</div>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Phone Number</label>
        <input
          type="tel"
          name="PhoneNumber"
          value={formData.PhoneNumber}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            Object.assign(e.target.style, inputFocusStyle);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>
          Email <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="email"
          name="Email"
          value={formData.Email}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            Object.assign(e.target.style, inputFocusStyle);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        {errors.Email && <div style={errorStyle}>{errors.Email}</div>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>
          Street Address <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          name="StreetAddress"
          value={formData.StreetAddress}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            Object.assign(e.target.style, inputFocusStyle);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        {errors.StreetAddress && <div style={errorStyle}>{errors.StreetAddress}</div>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>
          City <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          name="City"
          value={formData.City}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            Object.assign(e.target.style, inputFocusStyle);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        {errors.City && <div style={errorStyle}>{errors.City}</div>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>
          State <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          name="State"
          value={formData.State}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            Object.assign(e.target.style, inputFocusStyle);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        {errors.State && <div style={errorStyle}>{errors.State}</div>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>
          Zip Code <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          name="ZipCode"
          value={formData.ZipCode}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            Object.assign(e.target.style, inputFocusStyle);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        {errors.ZipCode && <div style={errorStyle}>{errors.ZipCode}</div>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Location Status</label>
        <select
          name="LocationStatus"
          value={formData.LocationStatus}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            Object.assign(e.target.style, inputFocusStyle);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="off">Off</option>
          <option value="on">On</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Rider Status</label>
        <select
          name="rider_status"
          value={formData.rider_status}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="Inactive">Inactive</option>
          <option value="Active">Active</option>
        </select>
      </div>

      <div style={buttonContainerStyle}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            ...buttonStyle,
            backgroundColor: '#ffffff',
            color: '#64748b',
            border: '1px solid #e5e7eb',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            ...buttonStyle,
            backgroundColor: '#3b82f6',
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
        >
          {rider ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default Form;

