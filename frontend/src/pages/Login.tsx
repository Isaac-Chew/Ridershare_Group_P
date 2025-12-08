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
    <div className="min-h-screen bg-gray-50">
      {/* Header - matches structure from Driver/Rider pages */}
      <header className="bg-white py-5 px-6 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="small" showSubtitle={false} />
            <div className="h-8 w-px bg-gray-200" />
            <h2 className="text-lg font-semibold text-gray-900">Welcome</h2>
          </div>

          <div className="flex items-center gap-3">
            {!state.isAuthenticated ? (
              <button
                onClick={() => signIn()}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
              >
                Sign in
              </button>
            ) : (
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 transition"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Intro card (span 2 on large screens) */}
          <section className="lg:col-span-2 flex items-center">
            <div className="w-full bg-white rounded-2xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                  <Logo size="medium" showSubtitle={false} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Rideshare Portal</h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Sign in to manage your rides. Or, create a new rider or driver profile
                    below if you're setting up an account for the first time.
                  </p>

                  {/* Role buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => { setShowRiderForm(true); setShowDriverForm(false); }}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      Add New Rider
                    </button>

                    <button
                      onClick={() => { setShowDriverForm(true); setShowRiderForm(false); }}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      Add New Driver
                    </button>
                  </div>

                  <div className="mt-4">
                    {!state.isAuthenticated ? (
                      <p className="text-sm text-gray-500">Please sign in with Asgardeo to continue.</p>
                    ) : (
                      <p className="text-sm text-gray-500">Roles: {loadingRoles ? 'Loading...' : (roles.join(', ') || 'None')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right: Forms area */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 max-h-[70vh] overflow-y-auto">
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
                <div className="text-center">
                  <p className="text-sm text-gray-600">Use the controls on the left to create a rider or driver, or sign in above.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Login;
