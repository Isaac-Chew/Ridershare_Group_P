// src/pages/Login.tsx
import React, { useEffect, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import Form from "../components/Form";
import DriverForm from "../components/DriverForm";
import { RiderFormData, DriverFormData } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const Login: React.FC = () => {
  const { state, signIn, signOut, getDecodedIDToken } = useAuthContext();

  const [roles, setRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const [showRiderForm, setShowRiderForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);

  // Load roles whenever user becomes authenticated
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

      alert("Rider created successfully");
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

      alert("Driver created successfully");
      setShowDriverForm(false);
    } catch (err) {
      console.error("Error creating driver from login:", err);
      alert(err instanceof Error ? err.message : "Failed to create driver");
    }
  };

  return (
    <div className="App">
      <h1>Rideshare Login</h1>

      {/* Not signed in: just show sign-in button */}
      {!state.isAuthenticated && (
        <>
          <p>Please sign in to continue.</p>
          <button onClick={() => signIn()}>Sign in with Asgardeo</button>
        </>
      )}

      {/* Signed in: show roles, add buttons, and forms */}
      {state.isAuthenticated && (
        <>
          {loadingRoles ? (
            <p>Loading your account…</p>
          ) : roles.length > 0 ? (
            <p>You're signed in with roles: {roles.join(", ")}</p>
          ) : (
            <p>You're signed in, but no roles are assigned.</p>
          )}

          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <button
              onClick={() => {
                setShowRiderForm(true);
                setShowDriverForm(false);
              }}
            >
              Add New Rider
            </button>

            <button
              onClick={() => {
                setShowDriverForm(true);
                setShowRiderForm(false);
              }}
            >
              Add New Driver
            </button>
          </div>

          {/* Rider form inline on login page */}
          {showRiderForm && (
            <Form
              rider={null}
              onSubmit={handleRiderSubmit}
              onCancel={() => setShowRiderForm(false)}
            />
          )}

          {/* Driver form inline on login page */}
          {showDriverForm && (
            <DriverForm
              driver={null}
              onSubmit={handleDriverSubmit}
              onCancel={() => setShowDriverForm(false)}
            />
          )}

          <button style={{ marginTop: "24px" }} onClick={() => signOut()}>
            Sign out
          </button>
        </>
      )}
    </div>
  );
};

export default Login;
