// src/App.tsx
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "@asgardeo/auth-react";
import Rider from "./pages/Rider";
import Login from "./pages/Login";
import React, { useEffect, useState } from "react";
// import Driver from "./pages/Driver"; // if you add a driver page later

const App: React.FC = () => {
  const { state, getDecodedIDToken } = useAuthContext();

  const [roles, setRoles] = useState<string[]>([]);

  // Load roles from the ID token after the user logs in
  useEffect(() => {
    const loadRoles = async () => {
      if (!state.isAuthenticated) {
        setRoles([]);
        return;
      }

      try {
        const payload: any = await getDecodedIDToken();
        const tokenRoles: string[] =
          (payload?.roles as string[]) ||
          (payload?.role as string[]) ||
          [];

        setRoles(tokenRoles);
      } catch (err) {
        console.error("Failed to decode ID token", err);
        setRoles([]);
      }
    };

    loadRoles();
  }, [state.isAuthenticated, getDecodedIDToken]);

  const isRider = roles.includes("rider");
  // const isDriver = roles.includes("driver");

  return (
    <Routes>
      {/* Public login page */}
      <Route path="/" element={<Login />} />

      {/* Protected Rider page: must be logged in AND have rider role */}
      <Route
        path="/rider"
        element={
          state.isAuthenticated && isRider ? (
            <Rider />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Example for a driver route later:
      <Route
        path="/driver"
        element={
          state.isAuthenticated && isDriver ? (
            <Driver />
          ) : (
            <Navigate to="/unauthorized" replace />
          )
        }
      /> */}
    </Routes>
  );
};

export default App;
