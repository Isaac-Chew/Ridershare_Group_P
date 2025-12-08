import React, { useState, useEffect } from 'react';
import { Driver, DriverFormData } from '../types';

interface DriverFormProps {
  driver?: Driver | null;
  onSubmit: (data: DriverFormData) => void;
  onCancel: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({ driver, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<DriverFormData>({
    FirstName: '',
    LastName: '',
    DateOfBirth: '',
    PhoneNumber: '',
    Email: '',
    StreetAddress: '',
    City: '',
    State: '',
    ZipCode: '',
    Status: '',
    LicenseNumber: '',
    InsuranceID: 0,
    BankID: 0,
    VehicleID: 0,
    VehicleColor: '',
    VehicleMake: '',
    VehicleModel: '',
    VehicleLicensePlate: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DriverFormData, string>>>({});

  useEffect(() => {
    try {
      if (driver) {
        // Safely handle DateOfBirth - it might be null or in different formats
        let dateOfBirth = '';
        try {
          if (driver.DateOfBirth) {
            if (typeof driver.DateOfBirth === 'string') {
              dateOfBirth = driver.DateOfBirth.includes('T') 
                ? driver.DateOfBirth.split('T')[0] 
                : driver.DateOfBirth;
            } else {
              dateOfBirth = String(driver.DateOfBirth);
            }
          }
        } catch (e) {
          dateOfBirth = '';
        }
        
        setFormData({
          FirstName: (driver.FirstName || '').toString(),
          LastName: (driver.LastName || '').toString(),
          DateOfBirth: dateOfBirth,
          PhoneNumber: (driver.PhoneNumber || '').toString(),
          Email: (driver.Email || '').toString(),
          StreetAddress: (driver.StreetAddress || '').toString(),
          City: (driver.City || '').toString(),
          State: (driver.State || '').toString(),
          ZipCode: (driver.ZipCode || '').toString(),
          Status: (driver.Status || '').toString(),
          LicenseNumber: (driver.LicenseNumber || '').toString(),
          InsuranceID: driver.InsuranceID !== undefined && driver.InsuranceID !== null ? Number(driver.InsuranceID) : 0,
          BankID: driver.BankID !== undefined && driver.BankID !== null ? Number(driver.BankID) : 0,
          VehicleID: driver.VehicleID !== undefined && driver.VehicleID !== null ? Number(driver.VehicleID) : 0,
          VehicleColor: (driver.VehicleColor || '').toString(),
          VehicleMake: (driver.VehicleMake || '').toString(),
          VehicleModel: (driver.VehicleModel || '').toString(),
          VehicleLicensePlate: (driver.VehicleLicensePlate || '').toString(),
        });
      } else {
        // Reset form when no driver (adding new)
        setFormData({
          FirstName: '',
          LastName: '',
          DateOfBirth: '',
          PhoneNumber: '',
          Email: '',
          StreetAddress: '',
          City: '',
          State: '',
          ZipCode: '',
          Status: '',
          LicenseNumber: '',
          InsuranceID: 0,
          BankID: 0,
          VehicleID: 0,
          VehicleColor: '',
          VehicleMake: '',
          VehicleModel: '',
          VehicleLicensePlate: '',
        });
      }
    } catch (error) {
      // Set empty form on error
      setFormData({
        FirstName: '',
        LastName: '',
        DateOfBirth: '',
        PhoneNumber: '',
        Email: '',
        StreetAddress: '',
        City: '',
        State: '',
        ZipCode: '',
        Status: '',
        LicenseNumber: '',
        InsuranceID: 0,
        BankID: 0,
        VehicleID: 0,
        VehicleColor: '',
        VehicleMake: '',
        VehicleModel: '',
        VehicleLicensePlate: '',
      });
    }
  }, [driver]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DriverFormData, string>> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // Convert string IDs to numbers or undefined
      const payload: any = { ...formData };
      if (payload.InsuranceID) {
        payload.InsuranceID = parseInt(payload.InsuranceID) || null;
      } else {
        payload.InsuranceID = null;
      }
      if (payload.BankID) {
        payload.BankID = parseInt(payload.BankID) || null;
      } else {
        payload.BankID = null;
      }
      if (payload.VehicleID) {
        payload.VehicleID = parseInt(payload.VehicleID) || null;
      } else {
        payload.VehicleID = null;
      }
      
      // Convert empty strings to null for optional fields
      if (!payload.StreetAddress) payload.StreetAddress = null;
      if (!payload.City) payload.City = null;
      if (!payload.State) payload.State = null;
      if (!payload.ZipCode) payload.ZipCode = null;
      if (!payload.Status) payload.Status = null;
      if (!payload.LicenseNumber) payload.LicenseNumber = null;
      if (!payload.VehicleColor) payload.VehicleColor = null;
      if (!payload.VehicleMake) payload.VehicleMake = null;
      if (!payload.VehicleModel) payload.VehicleModel = null;
      if (!payload.VehicleLicensePlate) payload.VehicleLicensePlate = null;
      if (!payload.PhoneNumber) payload.PhoneNumber = null;

      onSubmit(payload as DriverFormData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof DriverFormData]) {
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
        {driver ? 'Edit Driver' : 'Add New Driver'}
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
        <label style={labelStyle}>Street Address</label>
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
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>City</label>
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
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>State</label>
        <input
          type="text"
          name="State"
          value={formData.State}
          onChange={handleChange}
          style={inputStyle}
          maxLength={2}
          placeholder="e.g., CA"
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
        <label style={labelStyle}>Zip Code</label>
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
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Status</label>
        <select
          name="Status"
          value={formData.Status}
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
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>License Number</label>
        <input
          type="text"
          name="LicenseNumber"
          value={formData.LicenseNumber}
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
        <label style={labelStyle}>Insurance ID</label>
        <input
          type="number"
          name="InsuranceID"
          value={formData.InsuranceID}
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
        <label style={labelStyle}>Bank ID</label>
        <input
          type="number"
          name="BankID"
          value={formData.BankID}
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
        <label style={labelStyle}>Vehicle ID</label>
        <input
          type="number"
          name="VehicleID"
          value={formData.VehicleID}
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
        <label style={labelStyle}>Vehicle Color</label>
        <input
          type="text"
          name="VehicleColor"
          value={formData.VehicleColor}
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
        <label style={labelStyle}>Vehicle Make</label>
        <input
          type="text"
          name="VehicleMake"
          value={formData.VehicleMake}
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
        <label style={labelStyle}>Vehicle Model</label>
        <input
          type="text"
          name="VehicleModel"
          value={formData.VehicleModel}
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
        <label style={labelStyle}>Vehicle License Plate</label>
        <input
          type="text"
          name="VehicleLicensePlate"
          value={formData.VehicleLicensePlate}
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
          {driver ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default DriverForm;

