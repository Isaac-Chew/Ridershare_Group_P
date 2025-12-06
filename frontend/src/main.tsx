import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@asgardeo/auth-react";
import { BrowserRouter } from "react-router-dom";

const origin = window.location.origin; // works for localhost *and* Render

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider
      config={{
        signInRedirectURL: `${origin}`,
        signOutRedirectURL: `${origin}`,
        clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID,
        baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL,
        scope: ["openid", "profile", "roles"],
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
