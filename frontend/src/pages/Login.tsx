// src/pages/Login.tsx
import React, { useEffect, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { Navigate } from "react-router-dom";
import Form from "../components/Form";
import DriverForm from "../components/DriverForm";
import Logo from "../components/Logo";
import { RiderFormData, DriverFormData } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const Login: React.FC = () => {
  const { state, signIn, signOut, getDecodedIDToken } = useAuthContext();

  const [roles, setRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const [showRiderForm, setShowRiderForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);

  // Load roles only when authenticated
  useEffect(() => {
    const loadRoles = async () => {
      if (!state.isAuthenticated) {
        setRoles([]);
        setLoadingRoles(false);
        return;
      }

      try {
        const payload: any = await getDecodedIDToken();
        console.log("ID token payload:", payload);

        const tokenRoles: string[] =
          (payload?.roles as string[]) ||
          (payload?.role as string[]) ||
          [];

        setRoles(tokenRoles);
      } catch (err) {
        console.error("Error decoding ID token:", err);
        setRoles([]);
      }

      setLoadingRoles(false);
    };

    loadRoles();
  }, [state.isAuthenticated, getDecodedIDToken]);

  // ===========================
  // REDIRECT AFTER SIGN-IN (Asgardeo)
  // ===========================
  if (
    state.isAuthenticated &&
    !loadingRoles &&
    !showRiderForm &&
    !showDriverForm
  ) {
    if (roles.includes("rider")) {
      return <Navigate to="/rider" replace />;
    }
    if (roles.includes("driver")) {
      return <Navigate to="/driver" replace />;
    }
    // No role: stay on login and show the page below
  }

  // ===========================
  // RIDER SUBMIT
  // ===========================
  const handleRiderSubmit = async (data: RiderFormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/riders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create rider");
      }

      alert("Rider created successfully!");
      setShowRiderForm(false);
    } catch (err) {
      console.error("Error creating rider from login:", err);
      alert(err instanceof Error ? err.message : "Failed to create rider");
    }
  };

  // ===========================
  // DRIVER SUBMIT
  // ===========================
  const handleDriverSubmit = async (data: DriverFormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/driver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create driver");
      }

      alert("Driver created successfully!");
      setShowDriverForm(false);
    } catch (err) {
      console.error("Error creating driver from login:", err);
      alert(err instanceof Error ? err.message : "Failed to create driver");
    }
  };

  // ===========================
  // STYLES (matching Driver.tsx pattern)
  // ===========================
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

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#6b7280',
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  };

  const contentBoxStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  };

  const formContainerStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    maxHeight: '70vh',
    overflowY: 'auto',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    marginTop: '20px',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '16px',
  };

  // ===========================
  // RENDER
  // ===========================
  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={titleSectionStyle}>
          <Logo size="medium" showSubtitle={false} />
          <div style={{ height: '32px', width: '1px', backgroundColor: '#e5e7eb' }} />
          <h2 style={{ margin: 0, color: '#1f2937', fontWeight: 600 }}>Welcome to Rideshare</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!state.isAuthenticated ? (
            <button 
              onClick={() => signIn()} 
              style={buttonStyle}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
            >
              Sign In
            </button>
          ) : (
            <button 
              onClick={() => signOut()} 
              style={secondaryButtonStyle}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4b5563'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#6b7280'; }}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      <div style={contentStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Left Column: Info and Controls */}
          <div style={contentBoxStyle}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontWeight: 600, fontSize: '20px' }}>
              Get Started
            </h3>
            
            <p style={textStyle}>
              Sign in with Asgardeo to manage your rides, or create a new profile below.
            </p>

            {!state.isAuthenticated && (
              <p style={{ ...textStyle, color: '#991b1b', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '6px' }}>
                Please sign in to continue.
              </p>
            )}

            {state.isAuthenticated && (
              <p style={{ ...textStyle, color: '#1e40af', backgroundColor: '#dbeafe', padding: '12px', borderRadius: '6px' }}>
                Roles: {loadingRoles ? 'Loading...' : (roles.join(', ') || 'None assigned yet')}
              </p>
            )}

            <div style={{ marginTop: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1f2937', fontWeight: 500, fontSize: '14px' }}>
                Create New Profile
              </h4>
              <div style={buttonGroupStyle}>
                <button
                  onClick={() => {
                    setShowRiderForm(true);
                    setShowDriverForm(false);
                  }}
                  style={buttonStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
                >
                  Add Rider
                </button>

                <button
                  onClick={() => {
                    setShowDriverForm(true);
                    setShowRiderForm(false);
                  }}
                  style={buttonStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
                >
                  Add Driver
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Forms */}
          <div style={formContainerStyle}>
            {showRiderForm && (
              <Form
                rider={null}
                onSubmit={handleRiderSubmit}
                onCancel={() => setShowRiderForm(false)}
              />
            )}

            {showDriverForm && (
              <DriverForm
                driver={null}
                onSubmit={handleDriverSubmit}
                onCancel={() => setShowDriverForm(false)}
              />
            )}

            {!showRiderForm && !showDriverForm && (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                <p>Select an option on the left to create a new rider or driver profile.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;