// components/Dashboard.jsx
import React from "react";
import { Container, Row, Col } from "react-bootstrap";

import SecurityCard from "./SecurityCard";
import DevicesAtRisk from "./BandwidthUsage";
import ConsoleOutput from "./console";
import TrafficMonitoring from "./TrafficMonitoring";
import DeviceList from "./DeviceList";
import SystemData from "./systemData";

export default function Dashboard() {
  return (
    <Container fluid className="mt-4">
      <Row>
        <Col lg={4} md={12} className="mb-4">
          <h5 className="mb-3">
            🛡️ Network & Device Security
          </h5>
          <SecurityCard />
          <DevicesAtRisk className="mt-4" />

          <h5 className="mt-5 mb-3">🖳 System Console</h5>
          <ConsoleOutput />
        </Col>

        <Col lg={8} md={12} className="mb-4">
          <TrafficMonitoring />

          <div className="mt-4">
            <DeviceList className="mb-4" />
            <SystemData />
          </div>
        </Col>
      </Row>
    </Container>
  );
}
