import { useState } from "react";
import { Button, Container, Form, Modal, Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
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
          <Navbar.Brand href="/">PMS 2030</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <LinkContainer to="/patients">
                <Nav.Link href="#patients">Patients</Nav.Link>
              </LinkContainer>
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
