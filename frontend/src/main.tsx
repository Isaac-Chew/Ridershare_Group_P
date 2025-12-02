import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AsgardeoProvider } from "@asgardeo/react";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AsgardeoProvider
      clientId={import.meta.env.VITE_ASGARDEO_CLIENT_ID}
      baseUrl={import.meta.env.VITE_ASGARDEO_BASE_URL}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AsgardeoProvider>
  </React.StrictMode>
);
