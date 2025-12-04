import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AsgardeoProvider } from "@asgardeo/react";
import { BrowserRouter } from "react-router-dom";

const origin = window.location.origin; // works for localhost and Render

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AsgardeoProvider
      clientId={import.meta.env.VITE_ASGARDEO_CLIENT_ID}
      baseUrl={import.meta.env.VITE_ASGARDEO_BASE_URL}
      afterSignInUrl={`${origin}/rider`}
      afterSignOutUrl={`${origin}/`}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AsgardeoProvider>
  </React.StrictMode>
);
