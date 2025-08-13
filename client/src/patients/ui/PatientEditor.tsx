import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import { PatientsApi } from "../api/PatientsApi";
import { PatientVisitsApi } from "../api/PatientVisitsApi";
import type {
  IPatientEntity,
  IPatientVisitEntity,
} from "../../../../common/src/api/database/DatabaseEntities";

interface FormState {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO string for input type=date
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  medicalRecordNumber: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

const defaultState: FormState = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  phone: "",
  address: "",
  medicalRecordNumber: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
};

export const PatientEditor: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const patientsApi = useMemo(() => new PatientsApi(), []);
  const visitsApi = useMemo(() => new PatientVisitsApi(), []);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(defaultState);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [visits, setVisits] = useState<IPatientVisitEntity[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [visitsError, setVisitsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      setFetching(true);
      try {
        const data = (await patientsApi.dataApi.getItem(
          id
        )) as unknown as IPatientEntity;
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth).toISOString().substring(0, 10)
            : "",
          gender: data.gender || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          medicalRecordNumber: data.medicalRecordNumber || "",
          emergencyContactName: data.emergencyContactName || "",
          emergencyContactPhone: data.emergencyContactPhone || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load patient");
      } finally {
        setFetching(false);
      }
    };
    fetchPatient();
  }, [id, patientsApi]);

  // Load visits when editing existing patient
  useEffect(() => {
    const loadVisits = async () => {
      if (!id) return;
      setVisitsLoading(true);
      setVisitsError(null);
      try {
        const data = await visitsApi.dataApi.findByField("patientId", id);
        setVisits(data as IPatientVisitEntity[]);
      } catch (err) {
        setVisitsError(
          err instanceof Error ? err.message : "Failed to load visits"
        );
      } finally {
        setVisitsLoading(false);
      }
    };
    loadVisits();
  }, [id, visitsApi]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        ...form,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : null,
      };
      if (isEdit && id) {
        await patientsApi.dataApi.update(id, payload);
        setSuccess("Patient updated successfully");
      } else {
        await patientsApi.dataApi.create(payload);
        setSuccess("Patient created successfully");
        setForm(defaultState);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">
                {isEdit ? "Edit Patient" : "Add Patient"}
              </h3>
            </Card.Header>
            <Card.Body>
              {fetching && (
                <div className="text-center mb-3">
                  <Spinner animation="border" />
                </div>
              )}
              {error && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}
              {success && (
                <Alert
                  variant="success"
                  dismissible
                  onClose={() => setSuccess(null)}
                >
                  {success}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="firstName">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="lastName">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group controlId="dateOfBirth">
                      <Form.Label>DOB</Form.Label>
                      <Form.Control
                        type="date"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="gender">
                      <Form.Label>Gender</Form.Label>
                      <Form.Control
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="medicalRecordNumber">
                      <Form.Label>MRN</Form.Label>
                      <Form.Control
                        name="medicalRecordNumber"
                        value={form.medicalRecordNumber}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="phone">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group controlId="address">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="emergencyContactName">
                      <Form.Label>Emergency Contact Name</Form.Label>
                      <Form.Control
                        name="emergencyContactName"
                        value={form.emergencyContactName}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="emergencyContactPhone">
                      <Form.Label>Emergency Contact Phone</Form.Label>
                      <Form.Control
                        name="emergencyContactPhone"
                        value={form.emergencyContactPhone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-between">
                  <div>
                    <Button
                      variant="secondary"
                      className="me-2"
                      onClick={() => navigate(-1)}
                    >
                      Back
                    </Button>
                  </div>
                  <div>
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading
                        ? "Saving..."
                        : isEdit
                        ? "Save Changes"
                        : "Create Patient"}
                    </Button>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
          {isEdit && (
            <Card className="mt-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Visits ({visits.length})</h5>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/patients/${id}/visits/create`)}
                >
                  New Visit
                </Button>
              </Card.Header>
              <Card.Body className="p-0">
                {visitsLoading && (
                  <div className="text-center p-3">
                    <Spinner animation="border" size="sm" /> Loading visits...
                  </div>
                )}
                {visitsError && (
                  <Alert
                    variant="danger"
                    className="m-3"
                    dismissible
                    onClose={() => setVisitsError(null)}
                  >
                    {visitsError}
                  </Alert>
                )}
                {!visitsLoading && visits.length === 0 && !visitsError && (
                  <div className="p-3 text-center text-muted">
                    No visits recorded yet.
                  </div>
                )}
                {!visitsLoading && visits.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Doctor</th>
                          <th>Problem</th>
                          <th>Diagnosis</th>
                          <th>Prescriptions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visits
                          .slice()
                          .sort(
                            (a, b) =>
                              new Date(b.dateOfVisit).getTime() -
                              new Date(a.dateOfVisit).getTime()
                          )
                          .map((v) => (
                            <tr key={v.id}>
                              <td>
                                {v.dateOfVisit
                                  ? new Date(v.dateOfVisit).toLocaleString()
                                  : ""}
                              </td>
                              <td>{v.doctorName}</td>
                              <td
                                className="text-truncate"
                                style={{ maxWidth: 180 }}
                              >
                                {v.problem}
                              </td>
                              <td
                                className="text-truncate"
                                style={{ maxWidth: 180 }}
                              >
                                {v.diagnosis || ""}
                              </td>
                              <td
                                className="text-truncate"
                                style={{ maxWidth: 180 }}
                              >
                                {v.prescriptions || ""}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};
