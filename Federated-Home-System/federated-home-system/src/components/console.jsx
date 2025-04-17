import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ConsoleOutput = () => {
  const [rawLogs, setRawLogs] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hideInfo, setHideInfo] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const entriesPerPage = 10;

   // Fetch logs from API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:5000/api/logs"
        );
        const data = await res.json();
        if (data.status === "Success")
          setRawLogs(data.logs);
        else
          console.error("Error fetching logs:", data.error);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

 /*  // Mock logs for local testing
  useEffect(() => {
    setLoading(false);
    const mockLogs = `
2025-04-17T10:00:00.000Z Router: INFO System boot
2025-04-17T10:05:12.123Z Router: WARN Unexpected inbound traffic from IP 192.168.1.50
2025-04-17T10:10:45.543Z Router: ERROR DHCP failure on interface eth0
2025-04-17T10:12:34.789Z Router: INFO Connection re-established
  `;
    setRawLogs(mockLogs);
  }, []); */
  // Parse raw logs into structured entries
  useEffect(() => {
    if (!rawLogs) return;
    const lines = rawLogs
      .split("\n")
      .filter((line) => line.trim());
    const parsed = lines.map((line, idx) => {
      const parts = line.match(
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)?\s*(.*)$/
      );
      const timestamp = parts && parts[1] ? parts[1] : "";
      const message = parts && parts[2] ? parts[2] : line;
      let level = "Info";
      if (/ERROR|Error/.test(message)) level = "Error";
      else if (/WARN|Warning/.test(message))
        level = "Warning";
      return { id: idx + 1, timestamp, message, level };
    });
    setLogs(parsed);
  }, [rawLogs]);

  // Filtering and pagination
  const filtered = logs
    .filter((entry) =>
      entry.message
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((entry) =>
      hideInfo ? entry.level !== "Info" : true
    );
  const totalPages =
    Math.ceil(filtered.length / entriesPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  if (loading) return <p>Loading logs...</p>;

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1000); // notification lasts 1 second
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="mb-3">
          📝 Intrusion Detection Logs
        </h5>
        <div className="d-flex mb-2 gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id="hideInfo"
              checked={hideInfo}
              onChange={() => {
                setHideInfo(!hideInfo);
                setCurrentPage(1);
              }}
            />
            <label
              className="form-check-label"
              htmlFor="hideInfo"
            >
              Hide Info
            </label>
          </div>
        </div>
        <div
          className="table-responsive"
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            fontFamily: "monospace",
            fontSize: "0.85rem",
            lineHeight: "1.4",
          }}
        >
          <table className="table table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th
                  className="position-sticky start-0 bg-light"
                  style={{ zIndex: 2 }}
                >
                  #
                </th>
                <th>Timestamp</th>
                <th>Level</th>
                <th>Message</th>
                <th>Copy</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((entry) => (
                <tr
                  key={entry.id}
                  className={
                    entry.level === "Error"
                      ? "table-danger"
                      : entry.level === "Warning"
                      ? "table-warning"
                      : ""
                  }
                >
                  <td
                    className="position-sticky start-0 bg-white"
                    style={{ zIndex: 1 }}
                  >
                    {entry.id}
                  </td>
                  <td>{entry.timestamp}</td>
                  <td>{entry.level}</td>
                  <td
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {entry.message}
                  </td>
                  <td className="d-flex align-items-center">
                    {copiedId === entry.id ? (
                      <span className="badge rounded-pill bg-success me-2">
                        Copied
                      </span>
                    ) : (
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() =>
                          handleCopy(
                            entry.id,
                            entry.message
                          )
                        }
                        title="Copy message"
                      >
                        📋
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <nav className="mt-2">
          <ul className="pagination pagination-sm mb-0">
            {[...Array(totalPages)].map((_, idx) => (
              <li
                key={idx}
                className={`page-item ${
                  currentPage === idx + 1 ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ConsoleOutput;
