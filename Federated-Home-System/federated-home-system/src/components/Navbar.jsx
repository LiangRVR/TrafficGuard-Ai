// Navbar.jsx
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import { Bell } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

function AppNavbar() {
  return (
    <Navbar
      bg="light"
      expand="lg"
      sticky="top"
      className="shadow-sm"
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center"
        >
          🏠 FrED IoT Home System
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="offcanvasNavbar" />
        <Navbar.Collapse
          id="responsive-navbar-nav"
          className="justify-content-between"
        >
          {/* Left links */}
          <Nav className="me-auto align-items-center">
            <Nav.Link as={Link} to="/setup">
              Settings 🔧
            </Nav.Link>
            <Nav.Link href="#iot-devices">
              IoT Devices
            </Nav.Link>
            <Nav.Link href="#network-status">
              Network Status
            </Nav.Link>
            <NavDropdown
              title="More Options"
              id="collapsible-nav-dropdown"
            >
              <NavDropdown.Item href="#settings">
                Settings
              </NavDropdown.Item>
              <NavDropdown.Item href="#activity-logs">
                Activity Logs
              </NavDropdown.Item>
              <NavDropdown.Item href="#alerts">
                Alerts
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#support">
                Support
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>

          {/* Search bar */}
          <InputGroup className="d-none d-lg-flex w-auto">
            <FormControl placeholder="Search..." />
            <Button variant="outline-secondary">Go</Button>
          </InputGroup>

          {/* Right icons */}
          <Nav className="align-items-center">
            <Nav.Link
              href="#notifications"
              className="d-flex align-items-center"
            >
              <Bell size={28} />
              <span
                className="badge bg-danger rounded-circle ms-1"
                style={{
                  fontSize: "0.7rem",
                  lineHeight: 1,
                  width: "1rem",
                  height: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                3
              </span>
            </Nav.Link>
            <Nav.Link eventKey={2} href="#account">
              Exit ↪
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
