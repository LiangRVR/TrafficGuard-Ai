import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Spinner,
  InputGroup,
  FormControl,
  Button,
} from "react-bootstrap";

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(
        "http://127.0.0.1:5000/api/devices"
      );
      const data = await resp.json();
      if (data.status === "Success") {
        setDevices(data.devices);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load devices.");
    } finally {
      setLoading(false);
    }
  };

  /* useEffect(() => {
    fetchDevices();
  }, []); */

  

  const filtered = devices.filter((d) =>
    [d.mac_address, d.ip_address, d.hostname].some(
      (field) =>
        field?.toLowerCase().includes(filter.toLowerCase())
    )
  );

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          🖧 Connected Devices{" "}
          <span className="badge bg-secondary">
            {devices.length}
          </span>
        </h5>
        <div className="d-flex">
          <InputGroup size="sm" className="me-2">
            <FormControl
              placeholder="Search devices..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {filter && (
              <Button
                variant="outline-secondary"
                onClick={() => setFilter("")}
              >
                ✕
              </Button>
            )}
          </InputGroup>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={fetchDevices}
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {error && (
          <div className="text-danger p-3">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && !error ? (
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" />
          </div>
        ) : !filtered.length ? (
          <div className="text-center text-muted p-4">
            No devices found.
          </div>
        ) : (
          <div
            className="table-responsive px-3 py-2" // <-- added padding here
            style={{
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            <Table striped hover size="sm" className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Lease Time</th>
                  <th>MAC Address</th>
                  <th>IP Address</th>
                  <th>Hostname</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((dev, idx) => (
                  <tr key={idx}>
                    <td>
                      {dev.lease_time
                        ? new Date(
                            dev.lease_time
                          ).toLocaleString()
                        : "—"}
                    </td>
                    <td style={{ fontFamily: "monospace" }}>
                      {dev.mac_address}
                    </td>
                    <td>
                      <span className="fw-bold">
                        {dev.ip_address}
                      </span>
                    </td>
                    <td>
                      {dev.hostname || (
                        <span className="text-muted">
                          Unknown
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default DeviceList;
