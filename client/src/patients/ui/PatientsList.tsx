import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import { PatientsApi } from "../api/PatientsApi";
import type { IPatientEntity } from "../../../../common/src/api/database/DatabaseEntities";

export const PatientsList: React.FC = () => {
  const [patients, setPatients] = useState<IPatientEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const patientsApi = useMemo(() => new PatientsApi(), []);

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientsApi.dataApi.list();
      setPatients(data as IPatientEntity[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, [patientsApi]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleEdit = (id: string) => navigate(`/patients/edit/${id}`);
  const handleCreateNew = () => navigate("/patients/create");
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete patient "${name}"?`)) {
      try {
        await patientsApi.dataApi.delete(id);
        await loadPatients();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete patient"
        );
      }
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading patients...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Patients</h1>
            <Button variant="primary" onClick={handleCreateNew}>
              Add Patient
            </Button>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {patients.length === 0 && !loading ? (
            <Card>
              <Card.Body className="text-center">
                <h5>No patients found</h5>
                <p>Get started by adding your first patient.</p>
                <Button variant="primary" onClick={handleCreateNew}>
                  Add First Patient
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Header>
                <h5 className="mb-0">Patients ({patients.length})</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>MRN</th>
                      <th>DOB</th>
                      <th>Gender</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>
                            {p.firstName} {p.lastName}
                          </strong>
                        </td>
                        <td>{p.medicalRecordNumber}</td>
                        <td>
                          {p.dateOfBirth
                            ? new Date(p.dateOfBirth).toLocaleDateString()
                            : ""}
                        </td>
                        <td>{p.gender}</td>
                        <td>{p.email || ""}</td>
                        <td>{p.phone || ""}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(p.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-2"
                            onClick={() =>
                              navigate(`/patients/${p.id}/visits/create`)
                            }
                          >
                            New Visit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleDelete(p.id, `${p.firstName} ${p.lastName}`)
                            }
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
