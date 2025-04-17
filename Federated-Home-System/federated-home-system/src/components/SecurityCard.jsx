import React from "react";

const SecurityCard = () => (
  <div className="card mb-4 shadow-sm">
    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
      <h5 className="mb-0">🛡️ Network Security Status</h5>
      <span className="badge bg-success">Secure</span>
    </div>
    <ul className="list-group list-group-flush">
      <li className="list-group-item d-flex justify-content-between align-items-center">
        <span>Total Threats Detected</span>
        <span className="badge bg-danger">0</span>
      </li>
      <li className="list-group-item">
        <h6 className="mb-2">Threat Breakdown</h6>
        <div className="d-flex flex-wrap gap-2">
          <span className="badge bg-warning">
            Malware: 0
          </span>
          <span className="badge bg-info">Phishing: 0</span>
          <span className="badge bg-secondary">
            Intrusion: 0
          </span>
        </div>
      </li>
    </ul>
  </div>
);

export default SecurityCard;
