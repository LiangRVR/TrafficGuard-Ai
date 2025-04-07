// App.js
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./styles/styles.css"; // Import your custom CSS
import Navbar from "./components/Navbar";
import { Modal, Button } from "react-bootstrap";
import SecurityCard from "./components/SecurityCard";
import DeviceList from "./components/DeviceList";
import TrafficMonitoring from "./components/TrafficMonitoring";
import DevicesAtRisk from "./components/BandwidthUsage";
import ConsoleOutput from "./components/console";
import FetchDataButton from "./components/fetchData";
import SystemData from "./components/systemData";
import RouterInfo from "./components/RouterInfo";

function App() {
  const [showRouterModal, setShowRouterModal] =
    useState(true);

  const handleClose = () => setShowRouterModal(false);
  return (
    <div>
      <Modal
        show={showRouterModal}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Router Setup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RouterInfo />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Navbar />
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-4">
            <h3 className="mb-4">
              🛡️ Network & Device Security
            </h3>
            <SecurityCard />
            <DevicesAtRisk />
            <h3 className="mt-4 mb-3">🖳 System Console</h3>
            <ConsoleOutput />
          </div>
          <div className="col-md-8">
            <TrafficMonitoring />
            <DeviceList />
          </div>
          <SystemData />
        </div>
      </div>
    </div>
  );
}

export default App;
