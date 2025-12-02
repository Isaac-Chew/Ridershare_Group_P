// src/App.tsx
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@asgardeo/react";
import Rider from "./pages/Rider";
import Login from "./pages/Login";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Login page */}
      <Route path="/" element={<Login />} />

      {/* Protected Rider page */}
      <Route
        path="/rider"
        element={
          <>
            <SignedIn>
              <Rider />
            </SignedIn>

            {/* If user is not signed in and hits /rider, send them to login */}
            <SignedOut>
              <Navigate to="/" replace />
            </SignedOut>
          </>
        }
      />
    </Routes>
  );
};

export default App;
