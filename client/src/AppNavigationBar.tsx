import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useState } from "react";
import { useUser } from "./UserHook";

//import { dialog } from 'electron'

export function AppNavigationBar() {
  const { username, setUsername } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");

  const handleLogin = () => {
    setShowModal(true);
    setInput("");
  };
  const handleLogout = () => setUsername(null);
  const handleSave = () => {
    setUsername(input);
    setShowModal(false);
  };

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container fluid>
          <Navbar.Brand href="/">Form Server</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <LinkContainer to="/forms">
                <Nav.Link href="#forms">Forms</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/fillform">
                <Nav.Link href="#fillform">Fill Form</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/myforms">
                <Nav.Link href="#myforms">My Forms</Nav.Link>
              </LinkContainer>
              <NavDropdown title="Admin" id="basic-nav-dropdown">
                <LinkContainer to="/admin/importexport">
                  <NavDropdown.Item href="#action/3.1">
                    Import/Export Database
                  </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/connectivity">
                  <NavDropdown.Item href="#action/3.1">
                    Connectivity Tests
                  </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/pictureimport">
                  <NavDropdown.Item href="#action/3.1">
                    Picture Import
                  </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/sync">
                  <NavDropdown.Item href="#action/3.1">
                    Server Sync
                  </NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
            </Nav>
            <div className="d-flex align-items-center">
              {username && (
                <span style={{ marginRight: 10 }}>
                  User: <b>{username}</b>
                </span>
              )}
              {username ? (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleLogout}
                  style={{ marginRight: 5 }}
                >
                  Logout
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleLogin}>
                  Login
                </Button>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!input.trim()}
          >
            Select
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
