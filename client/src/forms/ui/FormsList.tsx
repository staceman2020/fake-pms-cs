import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FormsApi } from "../api/FormsApi";
import { SendFormByEmail } from "./SendFormByEmail";
import type { IFormEntity } from "../../../../common/src/api/database/DatabaseEntities";

export const FormsList: React.FC = () => {
  const [forms, setForms] = useState<IFormEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const formsApi = new FormsApi();

  const loadForms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await formsApi.dataApi.list();
      setForms(data as IFormEntity[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load forms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const handleEdit = (formId: string) => {
    navigate(`/forms/edit/${formId}`);
  };

  const handleCreateNew = () => {
    navigate("/forms/create");
  };

  const handleDelete = async (formId: string, formName: string) => {
    if (
      window.confirm(`Are you sure you want to delete the form "${formName}"?`)
    ) {
      try {
        await formsApi.dataApi.delete(formId.toString());
        await loadForms(); // Reload the list
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete form");
      }
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading forms...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Forms Management</h1>
            <Button variant="primary" onClick={handleCreateNew}>
              Create New Form
            </Button>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {forms.length === 0 && !loading ? (
            <Card>
              <Card.Body className="text-center">
                <h5>No forms found</h5>
                <p>Get started by creating your first form.</p>
                <Button variant="primary" onClick={handleCreateNew}>
                  Create First Form
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Header>
                <h5 className="mb-0">Forms ({forms.length})</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forms.map((form) => (
                      <tr key={form.id}>
                        <td>{form.id}</td>
                        <td>
                          <strong>{form.name}</strong>
                        </td>
                        <td>{form.description || "No description"}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(form.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-2"
                            onClick={() => navigate(`/forms/fill/${form.id}`)}
                          >
                            Fill
                          </Button>
                          <SendFormByEmail
                            form={form}
                            size="sm"
                            className="me-2"
                          />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(form.id, form.name)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};
