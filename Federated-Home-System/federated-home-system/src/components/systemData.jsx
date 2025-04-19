// SystemData.jsx
import React, { useState, useEffect } from "react";
import CpuMemoryUsage from "./cpuMemoryUsage";

const SystemData = () => {
  const [data, setData] = useState({
    wirelessClients: null,
    firewallRules: null,
    uptimeLoad: null,
    networkConfig: null,
  });
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("All");

  // Generic fetch helper
  const fetchData = async (endpoint) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/${endpoint}`
      );
      const result = await response.json();
      if (result.status === "Success") return result;
      console.error(
        `Error fetching ${endpoint}:`,
        result.error
      );
      return { error: result.error };
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return { error: error.message };
    }
  };

  // Load all data on mount (excluding CPU/Memory)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [
        wirelessClients,
        firewallRules,
        uptimeLoad,
        networkConfig,
      ] = await Promise.all([
        fetchData("wireless_clients"),
        fetchData("firewall_rules"),
        fetchData("uptime_load"),
        fetchData("network_config"),
      ]);
      setData({
        wirelessClients,
        firewallRules,
        uptimeLoad,
        networkConfig,
      });
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return <p>Loading system data...</p>;
  }

  let filteredRules = []

  const rules = data.firewallRules?.firewall_rules || [];
    // rules is a string. The following results in an error
  // filteredRules = rules.filter(
  //   (r) =>
  //     filterAction === "All" || r.action === filterAction
  // );


  return (
    <div className="row">
      {/* CPU & Memory Usage */}
      <div className="col-md-6 mb-3">
        <CpuMemoryUsage />
      </div>

      {/* Wireless Clients */}
      <div className="col-md-6 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h5>📡 Wireless Clients</h5>
            <hr />
            <pre
              className="bg-light p-2"
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {data.wirelessClients?.wireless_clients ||
                "N/A"}
            </pre>
          </div>
        </div>
      </div>

      {/* Firewall Rules */}
      <div className="col-md-6 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h5>🛡️ Firewall Rules</h5>
            <hr />
            <div className="d-flex align-items-center mb-2">
              <label
                htmlFor="filterAction"
                className="me-2 mb-0"
              >
                Filter by Action:
              </label>
              <select
                id="filterAction"
                className="form-select form-select-sm w-auto"
                value={filterAction}
                onChange={(e) =>
                  setFilterAction(e.target.value)
                }
              >
                <option value="All">All</option>
                <option value="ALLOW">Allow</option>
                <option value="DENY">Deny</option>
              </select>
            </div>
            <div className="table-responsive">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Rule Name</th>
                    <th>Action</th>
                    <th>Port/IP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((rule, idx) => (
                    <tr key={idx}>
                      <td>{rule.name}</td>
                      <td>
                        <span
                          className={
                            rule.action === "ALLOW"
                              ? "badge bg-success"
                              : "badge bg-danger"
                          }
                        >
                          {rule.action}
                        </span>
                      </td>
                      <td>
                        {rule.port ||
                          rule.ip ||
                          rule.port_ip}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Uptime & Load */}
      <div className="col-md-6 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h5>⏳ Uptime and Load</h5>
            <hr />
            <pre
              className="bg-light p-2"
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {data.uptimeLoad?.uptime_load || "N/A"}
            </pre>
          </div>
        </div>
      </div>

      {/* Network Configuration (full width) */}
      <div className="col-12 mb-3">
        <div className="card">
          <div className="card-body">
            <h5>🌐 Network Configuration</h5>
            <hr />
            <pre
              className="bg-light p-2"
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {data.networkConfig?.network_config || "N/A"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemData;
