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
    <div className="App">
      <h1>Rideshare Login</h1>

      {/* BUTTONS SHOW EVEN WHEN NOT AUTHENTICATED */}
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

      {/* RIDER FORM POPUP */}
      {showRiderForm && (
        <Form
          rider={null}
          onSubmit={handleRiderSubmit}
          onCancel={() => setShowRiderForm(false)}
        />
      )}

      {/* DRIVER FORM POPUP */}
      {showDriverForm && (
        <DriverForm
          driver={null}
          onSubmit={handleDriverSubmit}
          onCancel={() => setShowDriverForm(false)}
        />
      )}

      {/* SIGN-IN / SIGN-OUT */}
      {!state.isAuthenticated && (
        <button onClick={() => signIn()}>Sign in with Asgardeo</button>
      )}

      {state.isAuthenticated && (
        <>
          {!loadingRoles && <p>Roles: {roles.join(", ") || "None"}</p>}
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </div>
  );
};

export default Login;
