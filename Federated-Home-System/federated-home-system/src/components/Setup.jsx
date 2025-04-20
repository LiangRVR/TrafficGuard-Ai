// components/Setup.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";

const STORAGE_KEY = "routerInfo";

export default function Setup({ onSuccess }) {
  const [form, setForm] = useState({
    brand: "",
    model: "",
    ipAddress: "",
    username: "",
    password: "",
    port: "22",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    type: "",
    message: "",
  });

  // Pre‑fill non-sensitive fields
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
      errs.ipAddress = "Must be a valid IPv4";
    if (!form.username)
      errs.username = "Username is required";
    if (!form.password)
      errs.password = "Password is required";
    const p = Number(form.port);
    if (!p || p < 1 || p > 65535)
      errs.port = "Port 1–65535";
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
        // Save only non-sensitive
        const { brand, model, ipAddress, port } = form;
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ brand, model, ipAddress, port })
        );
        setResult({
          type: "success",
          message: "Settings saved!",
        });
        onSuccess();
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
    <Container
      fluid
      className="d-flex align-items-start justify-content-center pt-5"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
      }}
    >
      <Card
        style={{ maxWidth: 600, width: "100%" }}
        className="shadow"
      >
        <Card.Body className="p-4">
          <Card.Title className="mb-3">
            🔧 Router Setup
          </Card.Title>
          <Card.Text className="text-muted mb-4">
            Enter your router details
          </Card.Text>

          {result.message && (
            <Alert
              variant={result.type}
              onClose={() =>
                setResult({ type: "", message: "" })
              }
              dismissible
            >
              {result.message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="routerBrand">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    placeholder="Netgear"
                    value={form.brand}
                    isInvalid={!!errors.brand}
                    onChange={handleChange("brand")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.brand}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="routerModel">
                  <Form.Label>Model</Form.Label>
                  <Form.Control
                    placeholder="R7000"
                    value={form.model}
                    isInvalid={!!errors.model}
                    onChange={handleChange("model")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.model}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={8}>
                <Form.Group controlId="ipAddress">
                  <Form.Label>IP Address</Form.Label>
                  <Form.Control
                    placeholder="192.168.1.1"
                    value={form.ipAddress}
                    isInvalid={!!errors.ipAddress}
                    onChange={handleChange("ipAddress")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.ipAddress}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="port">
                  <Form.Label>Port</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.port}
                    isInvalid={!!errors.port}
                    onChange={handleChange("port")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.port}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    placeholder="admin"
                    value={form.username}
                    isInvalid={!!errors.username}
                    onChange={handleChange("username")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="password">
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
              </Col>
            </Row>

            <div className="d-grid mt-4">
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Connect & Continue"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
