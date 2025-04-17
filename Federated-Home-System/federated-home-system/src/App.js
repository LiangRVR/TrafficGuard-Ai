import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./styles/styles.css"; // Import your custom CSS
import Navbar from "./components/Navbar";
import {
  Modal,
  Button,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import SecurityCard from "./components/SecurityCard";
import DeviceList from "./components/DeviceList";
import TrafficMonitoring from "./components/TrafficMonitoring";
import DevicesAtRisk from "./components/BandwidthUsage";
import ConsoleOutput from "./components/console";
import FetchDataButton from "./components/fetchData";
import SystemData from "./components/systemData";
import RouterInfo from "./components/RouterInfo";

function App() {
  const [showRouterModal, setShowRouterModal] = useState(
    () => {
      return !localStorage.getItem("routerInfo");
    }
  );

  const handleClose = () => setShowRouterModal(false);

  return (
    <>
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

      <Container fluid className="mt-4">
        <Row>
          {/* Left column: Security & Console */}
          <Col lg={4} md={12} className="mb-4">
            <h5 className="mb-3">
              🛡️ Network & Device Security
            </h5>
            <SecurityCard />
            <DevicesAtRisk className="mt-4" />

            <h5 className="mt-5 mb-3">🖳 System Console</h5>
            <ConsoleOutput />
          </Col>

          {/* Right column: TrafficMonitoring, then stacked DeviceList & SystemData */}
          <Col lg={8} md={12} className="mb-4">
            <TrafficMonitoring />

            {/* Stacked below TrafficMonitoring */}
            <div className="mt-4">
              <DeviceList className="mb-4" />
              <SystemData />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
