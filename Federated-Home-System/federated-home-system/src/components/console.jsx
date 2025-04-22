import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

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
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "http://127.0.0.1:5000/api/logs"
      );
      const data = await res.json();
      if (data.status === "Success") {
        setRawLogs(data.logs);
      } else {
        console.error("Error fetching logs:", data.error);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto‑refresh on mount and every 40s
  useAutoRefresh(fetchLogs, 40000);

/*    // Mock logs for local testing
  useEffect(() => {
    setLoading(false);
    const mockLogs = `
Mon Apr 21 23:36:21 2025 kern.info kernel: [0.000000] Board has DDR2
Mon Apr 21 23:36:21 2025 kern.info kernel: [0.000000] Analog PMU set to hw control
Mon Apr 21 23:36:21 2025 kern.notice kernel: [e.eeee] Linux version 4.14.180 (builder@buildhost) (gcc version 7.5.0 (OpenWrt GCC 7.5.0 r11063-85e84e9f46)) #0 Sat May 16 18:32:20 2020
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
      // 1) Capture the syslog timestamp, facility and severity, plus the rest of the message
      const parts = line.match(
        /^([A-Z][a-z]{2}\s+[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\s+\d{4})\s+(\S+)\.(\w+)\s+(.*)$/
      );

      // 2) Extract or fall back
      const timestamp = parts ? parts[1] : "";
      const severity = parts ? parts[3].toLowerCase() : "";
      const message = parts ? parts[4] : line;

      console.log("Timestamp: ",timestamp);
      console.log("Severity: ",severity);
      console.log("Message: ",message);
      // 3) Map common severities into your levels
      let level = "Info";
      if (
        [
          "err",
          "error",
          "crit",
          "alert",
          "emerg",
          "panic",
        ].includes(severity)
      ) {
        level = "Error";
      } else if (["warn", "warning"].includes(severity)) {
        level = "Warning";
      }

      return {
        id: idx + 1,
        timestamp, // e.g. "Mon Apr 21 23:36:21 2025"
        message, // e.g. "kernel: [0.000000] Board has DDR2"
        level, // "Info" | "Warning" | "Error"
      };
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
        <nav className="mt-2 overflow-scroll">
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
