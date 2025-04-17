import React, { useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";

const TrafficMonitoring = () => {
  // Sample labels and data
  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
  ];
  const trafficData = [65, 59, 80, 81, 56, 55];
  const usageData = [120, 150, 180, 170, 200, 230];

  const anomalyThreshold = 75; // threshold line for anomalies
  const alertLevel = 180; // bar alert threshold

  // Line chart configuration with threshold line
  const lineChartData = {
    labels,
    datasets: [
      {
        label: "Network Traffic (MB)",
        data: trafficData,
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
      {
        label: "Anomaly Threshold",
        data: labels.map(() => anomalyThreshold),
        borderColor: "rgba(255, 0, 0, 0.6)",
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  // Bar chart configuration with dynamic colors
  const barChartData = {
    labels,
    datasets: [
      {
        label: "Network Usage (MB)",
        data: usageData,
        backgroundColor: usageData.map((v) =>
          v > alertLevel
            ? "rgba(255, 99, 132, 0.5)"
            : "rgba(75, 192, 192, 0.5)"
        ),
        borderColor: usageData.map((v) =>
          v > alertLevel
            ? "rgba(255, 99, 132, 1)"
            : "rgba(75, 192, 192, 1)"
        ),
        borderWidth: 1,
      },
    ],
  };

  // Sample suspicious entries
  const suspicious = [
    {
      id: 1,
      ip: "192.168.0.10",
      time: "2024-11-05 14:32",
      reason: "Data Spike",
      severity: "High",
    },
    {
      id: 2,
      ip: "10.0.0.15",
      time: "2024-11-05 15:20",
      reason: "Port Scan",
      severity: "Medium",
    },
  ];

  // Local state to switch views
  const [visibleChart, setVisibleChart] = useState(
    "networkTrafficChart"
  );

  return (
    <div className="card mb-4">
      <div className="card-body">
        {/* Title */}
        <h5 className="mb-3">📈 Network Trafficking:</h5>

        {/* Tab-style selector */}
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${
                visibleChart === "networkTrafficChart"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setVisibleChart("networkTrafficChart")
              }
            >
              Traffic
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                visibleChart === "networkUsageChart"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setVisibleChart("networkUsageChart")
              }
            >
              Usage
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                visibleChart === "suspiciousTrafficTable"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setVisibleChart("suspiciousTrafficTable")
              }
            >
              Suspicious
            </button>
          </li>
        </ul>

        {/* Content */}
        <div
          id="chartContainer"
          style={{ minHeight: "400px" }}
        >
          {visibleChart === "networkTrafficChart" && (
            <Line data={lineChartData} />
          )}
          {visibleChart === "networkUsageChart" && (
            <Bar data={barChartData} />
          )}
          {visibleChart === "suspiciousTrafficTable" && (
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>IP Address</th>
                  <th>Time Detected</th>
                  <th>Reason</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {suspicious.map((row) => (
                  <tr
                    key={row.id}
                    className={
                      row.severity === "High"
                        ? "table-danger"
                        : ""
                    }
                  >
                    <td>{row.id}</td>
                    <td>{row.ip}</td>
                    <td>{row.time}</td>
                    <td>{row.reason}</td>
                    <td>
                      <span
                        className={
                          row.severity === "High"
                            ? "badge bg-danger"
                            : row.severity === "Medium"
                            ? "badge bg-warning"
                            : "badge bg-secondary"
                        }
                      >
                        {row.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficMonitoring;
