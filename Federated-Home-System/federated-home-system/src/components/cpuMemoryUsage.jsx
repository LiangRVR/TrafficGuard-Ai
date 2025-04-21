import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  ProgressBar,
  Row,
  Col,
  Spinner,
  Button,
} from "react-bootstrap";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

const CpuMemoryUsage = () => {
  const [cpuData, setCpuData] = useState({});
  const [memoryData, setMemoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch function wrapped in useCallback so it's stable
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/cpu_memory"
      );
      const data = await response.json();
      if (data.status === "Success") {
        setCpuData(data.cpu || {});
        setMemoryData(data.memory || {});
        setLastUpdated(new Date());
      } else {
        console.error("Error fetching stats:", data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh on mount and every 25 seconds
  useAutoRefresh(fetchStats, 25000);

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
        <div>Loading CPU & Memory Stats...</div>
      </div>
    );
  }

  // Determine total memory if available
  const totalMem =
    memoryData.total ||
    Object.values(memoryData).reduce(
      (sum, val) => sum + parseInt(val || 0),
      0
    );

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">⚙️ CPU & Memory Usage</h5>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={fetchStats}
        >
          Refresh
        </Button>
      </Card.Header>
      <Card.Body>
        <p className="text-muted small">
          Last updated: {lastUpdated?.toLocaleTimeString()}
        </p>
        <Row className="mb-4">
          <Col md={6}>
            <h6>CPU Usage</h6>
            {Object.entries(cpuData).map(
              ([core, percent], idx) => (
                <div key={idx} className="mb-2">
                  <div className="d-flex justify-content-between">
                    <small>{core}</small>
                    <small>{percent}%</small>
                  </div>
                  <ProgressBar
                    now={percent}
                    label={`${percent}%`}
                    variant={
                      percent > 80 ? "danger" : "success"
                    }
                  />
                </div>
              )
            )}
          </Col>
          <Col md={6}>
            <h6>Memory Usage</h6>
            {totalMem > 0 && (
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <small>Used</small>
                  <small>
                    {formatKB(memoryData.used)} /{" "}
                    {formatKB(totalMem)}
                  </small>
                </div>
                <ProgressBar
                  now={Math.round(
                    (memoryData.used / totalMem) * 100
                  )}
                  label={`${Math.round(
                    (memoryData.used / totalMem) * 100
                  )}%`}
                  variant={
                    memoryData.used / totalMem > 0.8
                      ? "danger"
                      : "info"
                  }
                />
              </div>
            )}
            <table className="table table-sm table-borderless mb-0">
              <tbody>
                {Object.entries(memoryData)
                  .filter(
                    ([key]) =>
                      key !== "used" && key !== "total"
                  )
                  .map(([key, val], idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{key}</strong>
                      </td>
                      <td className="text-end">
                        {formatKB(val)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// Helper to format KB to human-readable
function formatKB(kb) {
  const value = parseInt(kb, 10);
  if (value >= 1024 * 1024)
    return `${(value / (1024 * 1024)).toFixed(1)} GB`;
  if (value >= 1024)
    return `${(value / 1024).toFixed(1)} MB`;
  return `${value} KB`;
}

export default CpuMemoryUsage;
