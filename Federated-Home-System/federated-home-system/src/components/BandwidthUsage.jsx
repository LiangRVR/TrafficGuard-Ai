import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Spinner,
  InputGroup,
  FormControl,
  Button,
  Badge,
} from "react-bootstrap";

const BandwidthUsage = () => {
  const [bandwidthData, setBandwidthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  // Threshold in bytes for “high” usage (e.g. 100 MB)
  const HIGH_USAGE_THRESHOLD = 100 * 1024 * 1024;

  const fetchBandwidth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/bandwidth"
      );
      const data = await response.json();
      if (data.status === "Success") {
        setBandwidthData(data.bandwidth);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load bandwidth data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBandwidth();
  }, []);

  // Simple client‑side filter by interface name
  const filtered = bandwidthData.filter((iface) =>
    iface.interface
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  return (
    <Card className="mb-4 shadow-sm">
      {/* Header with title + refresh */}
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">📡 Bandwidth Usage</h5>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={fetchBandwidth}
          disabled={loading}
        >
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Refresh"
          )}
        </Button>
      </Card.Header>

      <Card.Body className="p-0">
        {/* Error state */}
        {error && (
          <div className="text-danger p-3">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Filter input */}
        <div className="d-flex align-items-center px-3 py-2">
          <InputGroup size="sm" className="w-50">
            <FormControl
              placeholder="Filter interfaces..."
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
        </div>

        {/* Loading / Empty states */}
        {loading && !error ? (
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" />
          </div>
        ) : !filtered.length ? (
          <div className="text-center text-muted p-4">
            No interfaces found.
          </div>
        ) : (
          // Data table
          <div
            className="table-responsive px-3 py-2"
            style={{ maxHeight: "300px" }}
          >
            <Table striped hover size="sm" className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Interface</th>
                  <th>Received (Bytes)</th>
                  <th>Transmitted (Bytes)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, idx) => {
                  const isHigh =
                    d.receive_bytes >
                      HIGH_USAGE_THRESHOLD ||
                    d.transmit_bytes > HIGH_USAGE_THRESHOLD;
                  return (
                    <tr
                      key={idx}
                      className={
                        isHigh ? "table-warning" : ""
                      }
                    >
                      <td>{d.interface}</td>
                      <td>
                        {d.receive_bytes.toLocaleString()}{" "}
                        {d.receive_bytes >
                          HIGH_USAGE_THRESHOLD && (
                          <Badge
                            bg="danger"
                            className="ms-2"
                          >
                            High
                          </Badge>
                        )}
                      </td>
                      <td>
                        {d.transmit_bytes.toLocaleString()}{" "}
                        {d.transmit_bytes >
                          HIGH_USAGE_THRESHOLD && (
                          <Badge
                            bg="danger"
                            className="ms-2"
                          >
                            High
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default BandwidthUsage;
