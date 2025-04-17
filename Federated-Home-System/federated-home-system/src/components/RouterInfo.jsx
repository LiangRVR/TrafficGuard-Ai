// RouterInfo.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  InputGroup,
  Alert,
  Spinner,
} from "react-bootstrap";

const STORAGE_KEY = "routerInfo";

const RouterInfo = () => {
  const [form, setForm] = useState({
    brand: "",
    model: "",
    ipAddress: "",
    username: "",
    password: "",
    port: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    type: "",
    message: "",
  });

  // Load saved non-sensitive settings on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { brand, model, ipAddress, port } =
        JSON.parse(saved);
      setForm((f) => ({
        ...f,
        brand,
        model,
        ipAddress,
        port,
      }));
    }
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.brand) errs.brand = "Brand is required";
    if (!form.model) errs.model = "Model is required";
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(form.ipAddress))
      errs.ipAddress = "Enter a valid IPv4 address";
    if (!form.username)
      errs.username = "Username is required";
    if (!form.password)
      errs.password = "Password is required";
    const portNum = Number(form.port);
    if (!portNum || portNum < 1 || portNum > 65535)
      errs.port = "Port must be 1–65535";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((errs) => ({ ...errs, [field]: undefined }));
    setResult({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setResult({ type: "", message: "" });
    try {
      const resp = await fetch(
        "http://127.0.0.1:5000/api/router",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await resp.json();

      if (resp.ok && data.status === "Success") {
        // Save only non-sensitive settings
        const { brand, model, ipAddress, port } = form;
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ brand, model, ipAddress, port })
        );

        setResult({
          type: "success",
          message: "Router connected & settings saved!",
        });
      } else {
        throw new Error(data.error || "Server error");
      }
    } catch (err) {
      setResult({ type: "danger", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>Connect to Your Router</Card.Title>

        {result.message && (
          <Alert
            variant={result.type}
            onClose={() =>
              setResult({ type: "", message: "" })
            }
            dismissible
            className="mt-3"
          >
            {result.message}
          </Alert>
        )}

        <Form
          onSubmit={handleSubmit}
          noValidate
          className="mt-3"
        >
          {/* Brand */}
          <Form.Group
            controlId="routerBrand"
            className="mb-3"
          >
            <Form.Label>Router Brand</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Netgear"
              value={form.brand}
              isInvalid={!!errors.brand}
              onChange={handleChange("brand")}
            />
            <Form.Control.Feedback type="invalid">
              {errors.brand}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Model */}
          <Form.Group
            controlId="routerModel"
            className="mb-3"
          >
            <Form.Label>Router Model</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. R7000"
              value={form.model}
              isInvalid={!!errors.model}
              onChange={handleChange("model")}
            />
            <Form.Control.Feedback type="invalid">
              {errors.model}
            </Form.Control.Feedback>
          </Form.Group>

          {/* IP & Port */}
          <Form.Group
            controlId="ipAndPort"
            className="mb-3"
          >
            <Form.Label>IP Address & Port</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="192.168.1.1"
                value={form.ipAddress}
                isInvalid={!!errors.ipAddress}
                onChange={handleChange("ipAddress")}
              />
              <InputGroup.Text>:</InputGroup.Text>
              <Form.Control
                type="number"
                placeholder="80"
                value={form.port}
                style={{ width: "90px" }}
                isInvalid={!!errors.port}
                onChange={handleChange("port")}
              />
              <Form.Control.Feedback type="invalid">
                {errors.ipAddress || errors.port}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {/* Username */}
          <Form.Group
            controlId="routerUsername"
            className="mb-3"
          >
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="admin"
              value={form.username}
              isInvalid={!!errors.username}
              onChange={handleChange("username")}
            />
            <Form.Control.Feedback type="invalid">
              {errors.username}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Password */}
          <Form.Group
            controlId="routerPassword"
            className="mb-4"
          >
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={form.password}
              isInvalid={!!errors.password}
              onChange={handleChange("password")}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Submit */}
          <div className="text-end">
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Connecting…
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default RouterInfo;
