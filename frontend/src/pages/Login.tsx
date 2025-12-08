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

  // Redirect after sign-in (only if no form is open)
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
    // no role → stay on page
  }

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

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-900 via-slate-950 to-sky-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl rounded-3xl bg-slate-900/70 border border-slate-700/60 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="grid lg:grid-cols-[1.05fr,1fr]">
          {/* Left branding / hero side */}
          <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-indigo-600 px-8 py-10 sm:px-10 sm:py-12 text-white">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#ffffff_0,_transparent_50%)] pointer-events-none" />

            <div className="relative flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 shadow-lg">
                  <Logo size="medium" showSubtitle={false} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    Longhorn Rideshare
                  </h1>
                  <p className="mt-1 text-sm text-sky-50/90">
                    Manage rides, riders, and drivers through a single secure
                    portal.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base">
                <p className="text-sky-50/90">
                  Sign in with Asgardeo to access your dashboard, or quickly
                  register new riders and drivers from this page.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-[3px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs">
                      ✓
                    </span>
                    <span>Secure SSO with role-based access (Rider / Driver).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-[3px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs">
                      ✓
                    </span>
                    <span>Quick onboarding forms directly on the login screen.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-[3px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs">
                      ✓
                    </span>
                    <span>Clean, responsive UI built for desktop and mobile.</span>
                  </li>
                </ul>
              </div>

              {state.isAuthenticated && (
                <div className="mt-2 rounded-2xl bg-black/15 px-4 py-3 text-xs sm:text-sm text-sky-50/90">
                  <p className="font-medium">Signed in with Asgardeo</p>
                  {!loadingRoles && (
                    <p className="mt-1">
                      Roles detected:{" "}
                      <span className="font-semibold">
                        {roles.join(", ") || "none yet"}
                      </span>
                    </p>
                  )}
                  <p className="mt-1 text-sky-100/80">
                    You’ll be redirected automatically once a Rider or Driver
                    role is assigned.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right side: actions + forms */}
          <div className="bg-slate-950/60 px-6 py-7 sm:px-8 sm:py-9 flex flex-col gap-6">
            {/* Top text */}
            <div className="space-y-1 text-slate-50">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Use Asgardeo to sign in, or add a new rider or driver below.
              </p>
            </div>

            {/* Primary actions */}
            <div className="space-y-4">
              {/* Add rider/driver buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-sky-400/60 bg-sky-500/15 px-4 py-2.5 text-sm font-medium text-sky-100 hover:bg-sky-500/25 hover:border-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
                  onClick={() => {
                    setShowRiderForm(true);
                    setShowDriverForm(false);
                  }}
                >
                  Add New Rider
                </button>

                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-indigo-400/60 bg-indigo-500/15 px-4 py-2.5 text-sm font-medium text-indigo-100 hover:bg-indigo-500/25 hover:border-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
                  onClick={() => {
                    setShowDriverForm(true);
                    setShowRiderForm(false);
                  }}
                >
                  Add New Driver
                </button>
              </div>

              {/* Asgardeo auth controls */}
              <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-4 space-y-3">
                {!state.isAuthenticated && (
                  <>
                    <p className="text-xs sm:text-sm text-slate-300">
                      Sign in with your Asgardeo account to access the Rider or
                      Driver dashboards.
                    </p>
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
                      onClick={() => signIn()}
                    >
                      Sign in with Asgardeo
                    </button>
                  </>
                )}

                {state.isAuthenticated && (
                  <>
                    {!loadingRoles && (
                      <p className="text-xs sm:text-sm text-slate-300">
                        Current roles:{" "}
                        <span className="font-semibold text-slate-100">
                          {roles.join(", ") || "None assigned yet"}
                        </span>
                      </p>
                    )}
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-100 shadow-md hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
                      onClick={() => signOut()}
                    >
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Forms */}
            <div className="mt-1 rounded-2xl bg-slate-900/70 border border-slate-700/70 px-4 py-4 sm:px-5 sm:py-5 flex-1 overflow-y-auto max-h-[55vh]">
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
                <p className="text-sm text-slate-300 text-center">
                  Choose{" "}
                  <span className="font-semibold text-slate-100">
                    “Add New Rider”
                  </span>{" "}
                  or{" "}
                  <span className="font-semibold text-slate-100">
                    “Add New Driver”
                  </span>{" "}
                  above to open a registration form.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
