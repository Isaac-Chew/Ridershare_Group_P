// src/pages/Login.tsx
import React, { useEffect, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { Navigate } from "react-router-dom";
import Form from "../components/Form";
import DriverForm from "../components/DriverForm";
import Logo from "../components/Logo";
import { RiderFormData, DriverFormData } from "../types";
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    padding: '20px 40px',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
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
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 600,
    transition: 'background-color 0.15s',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    width: '100%',
  };

  const logoCircleStyle: React.CSSProperties = {
    width: '80px',
    height: '80px',
    borderRadius: '9999px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const roleButtonStyle: React.CSSProperties = {
    padding: '8px 14px',
    borderRadius: '9999px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontWeight: 500,
  };

  const panelStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    maxHeight: '70vh',
    overflowY: 'auto',
  };

  const mutedTextStyle: React.CSSProperties = {
    color: '#64748b',
    fontSize: '14px',
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={titleSectionStyle}>
          <Logo size="medium" showSubtitle={false} />
          <div style={{ height: '32px', width: '1px', backgroundColor: '#e5e7eb' }} />
          <h2 style={{ margin: 0, color: '#1f2937', fontWeight: 600 }}>Welcome</h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!state.isAuthenticated ? (
            <button
              onClick={() => signIn()}
              style={{ ...buttonStyle, backgroundColor: '#3b82f6' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={() => signOut()}
              style={{ ...buttonStyle, backgroundColor: '#6b7280' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4b5563'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#6b7280'; }}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      <div style={contentStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <section style={{ display: 'flex', alignItems: 'center' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={logoCircleStyle}>
                    <Logo size="medium" showSubtitle={false} />
                  </div>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#1f2937' }}>Rideshare Portal</h1>
                    <p style={{ marginTop: '10px', ...mutedTextStyle }}>
                      Sign in to manage your rides. Or, create a new rider or driver profile
                      below if you're setting up an account for the first time.
                    </p>

                    <div style={{ marginTop: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => { setShowRiderForm(true); setShowDriverForm(false); }}
                        style={roleButtonStyle}
                      >
                        Add New Rider
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowDriverForm(true); setShowRiderForm(false); }}
                        style={roleButtonStyle}
                      >
                        Add New Driver
                      </button>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      {!state.isAuthenticated ? (
                        <p style={mutedTextStyle}>Please sign in with Asgardeo to continue.</p>
                      ) : (
                        <p style={mutedTextStyle}>Roles: {loadingRoles ? 'Loading...' : (roles.join(', ') || 'None')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside>
              <div style={panelStyle}>
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
                  <div style={{ textAlign: 'center' }}>
                    <p style={mutedTextStyle}>Use the controls on the left to create a rider or driver, or sign in above.</p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
    }
  };

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-blue-600 rounded-3xl shadow-xl p-10 sm:p-12 text-center text-white flex flex-col gap-8">
        {/* Logo + title */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white flex items-center justify-center shadow-md">
            <Logo size="medium" showSubtitle={false} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rideshare Login</h1>
            <p className="text-sm sm:text-base text-blue-100">
              Sign in to manage your rides or register as a new rider or driver.
            </p>
          </div>
        </div>

        {/* Always-visible actions */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* Ghost toggle buttons */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-blue-200/70 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-50 hover:bg-blue-500/20 hover:border-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 focus-visible:ring-white transition"
              onClick={() => {
                setShowRiderForm(true);
                setShowDriverForm(false);
              }}
            >
              Add New Rider
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-blue-200/70 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-50 hover:bg-blue-500/20 hover:border-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 focus-visible:ring-white transition"
              onClick={() => {
                setShowDriverForm(true);
                setShowRiderForm(false);
              }}
            >
              Add New Driver
            </button>
          </div>

          {/* Auth controls */}
          <div className="mt-2 space-y-3">
            {!state.isAuthenticated && (
              <>
                <p className="text-xs sm:text-sm text-blue-100">
                  Please sign in with Asgardeo to continue.
                </p>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-white/95 px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-md hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 focus-visible:ring-white transition"
                  onClick={() => signIn()}
                >
                  Sign in with Asgardeo
                </button>
              </>
            )}

            {state.isAuthenticated && (
              <>
                {!loadingRoles && (
                  <p className="text-xs sm:text-sm text-blue-100">
                    Roles: {roles.join(", ") || "None assigned yet"}
                  </p>
                )}
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-blue-100/95 px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-md hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 focus-visible:ring-white transition"
                  onClick={() => signOut()}
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Forms (render exactly as before) */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 text-left max-h-[60vh] overflow-y-auto">
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
            <p className="text-sm text-gray-600 text-center">
              Use the buttons above to add a new rider or driver.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
