// App.js
import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/styles.css";

import AppNavbar from "./components/Navbar";
import Setup from "./components/Setup";
import Dashboard from "./components/Dashboard";

function App() {
  // true once routerInfo has been saved in localStorage
  const [configured, setConfigured] = useState(
    () => !!localStorage.getItem("routerInfo")
  );

  // passed down to Setup so it can flip us into "configured" state
  const handleConfigured = () => setConfigured(true);

  return (
    <BrowserRouter>
      {/* Always show the navbar */}
      <AppNavbar />

      <Routes>
        {/* Setup page */}
        <Route
          path="/setup"
          element={<Setup onSuccess={handleConfigured} />}
        />

        {/* Dashboard page */}
        <Route
          path="/dashboard"
          element={
            configured ? (
              <Dashboard />
            ) : (
              <Navigate to="/setup" replace />
            )
          }
        />

        {/* Redirect “/” to either /dashboard or /setup */}
        <Route
          path="/"
          element={
            configured ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/setup" replace />
            )
          }
        />

        {/* Catch-all redirects */}
        <Route
          path="*"
          element={
            configured ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/setup" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
