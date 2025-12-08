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
