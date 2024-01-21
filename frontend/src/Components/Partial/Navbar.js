import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { NavDropdown, Navbar, Nav, Container, Button } from "react-bootstrap";

function CustomNavbar() {
  const [activeTab, setActiveTab] = useState("admin1Home");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    // Remove the 'token' from localStorage
    localStorage.removeItem("token");

    // Add any additional logout logic here

    // Redirect or perform any other action after logout
    window.location.href = "/login";
  };

  return (
    <Navbar bg="light" expand="lg" style={{ padding: "2px" }}>
      <Container>
        <Navbar.Brand>
          <img alt="logo" src="/logo_new.png" style={{ maxHeight: "70px" }} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Link
              as={NavLink}
              to="/"
              onClick={() => handleTabChange("admin1Home")}
              className={activeTab === "admin1Home" ? "active" : ""}
            >
              Home
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/showUsers"
              onClick={() => handleTabChange("addStudent")}
              className={activeTab === "addStudent" ? "active" : ""}
            >
              All Members
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/showAdmins"
              onClick={() => handleTabChange("addAdmin")}
              className={activeTab === "addAdmin" ? "active" : ""}
            >
              All Admins
            </Nav.Link>

            <NavDropdown
              title="Event"
              id="basic-nav-dropdown"
              onSelect={(eventKey) => handleTabChange(eventKey)}
              className={
                activeTab === "CurrentEvent" || activeTab === "PastEvent"
                  ? "active"
                  : ""
              }
            >
              <NavDropdown.Item as={NavLink} to="/showCurrentEvents">
                Current Event
              </NavDropdown.Item>

              <NavDropdown.Item as={NavLink} to="/showPastEvents">
                Past Event
              </NavDropdown.Item>

              <NavDropdown.Item as={NavLink} to="/addEvent">
                Add Event
              </NavDropdown.Item>
            </NavDropdown>

            <Button
              variant="outline-dark"
              className="ml-2"
              onClick={handleLogout}
            >
              <span>Logout</span>
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
