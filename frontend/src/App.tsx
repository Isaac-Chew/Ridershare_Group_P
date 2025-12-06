// src/App.tsx
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "@asgardeo/auth-react";
import Rider from "./pages/Rider";
import Login from "./pages/Login";

const App: React.FC = () => {
  const { state } = useAuthContext();

  return (
    <Routes>
      {/* Public login page */}
      <Route path="/" element={<Login />} />

      {/* Protected Rider page */}
      <Route
        path="/rider"
        element={
          state.isAuthenticated ? (
            <Rider />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
