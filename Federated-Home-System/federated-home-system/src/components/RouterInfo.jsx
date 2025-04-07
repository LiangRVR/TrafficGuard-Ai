import React, { useState } from "react";

function RouterInfo() {
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [port, setPort] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/router",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ brand, model, ipAddress, username, password, port }),
                }
            );
            const data = await response.json();
            console.log("Router info saved:", data);
            // Optionally do something with response data
        } catch (error) {
            console.error("Error saving router info:", error);
        }
    };

    return (
        <div>
            <h2>Connect to Your Router</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Router Brand:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label>Router Model:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label>IP Address:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label>Username:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label>Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label>Port:</label>
                    <input
                        type="number"
                        className="form-control"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Connect
                </button>
            </form>
        </div>
    );
}

export default RouterInfo;
