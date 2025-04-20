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

import Setup from "./components/Setup"; // we'll alias RouterInfo as Setup
import Dashboard from "./components/Dashboard"; // new dashboard wrapper
import Navbar from "./components/Navbar"; // new navbar wrapper

function App() {
  // Tracks whether we've saved routerInfo
  const [configured, setConfigured] = useState(
    () => !!localStorage.getItem("routerInfo")
  );

  // Called by Setup when form submits successfully
  const handleConfigured = () => setConfigured(true);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Setup route */}
        <Route
          path="/setup"
          element={<Setup onSuccess={handleConfigured} />}
        />

        {/* Dashboard route; if not configured, redirect to /setup */}
        <Route
          path="/"
          element={
            configured ? (
              <Dashboard />
            ) : (
              <Navigate to="/setup" replace />
            )
          }
        />

        {/* Catch-all: send unknown URLs to dashboard or setup */}
        <Route
          path="*"
          element={
            configured ? (
              <Navigate to="/" replace />
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
