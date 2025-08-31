import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Tab,
  Tabs,
} from "react-bootstrap";
import { PatientVisitsApi } from "../api/PatientVisitsApi";
import type { IPatientVisitEntity } from "../../../../common/src/api/database/DatabaseEntities";

interface FormState {
  dateOfVisit: string;
  doctorName: string;
  problem: string;
  diagnosis: string;
  prescriptions: string;
  notes: string;
}

interface FormOption {
  label: string;
  value: string;
}

const defaultState: FormState = {
  dateOfVisit: new Date().toISOString().substring(0, 16), // for datetime-local
  doctorName: "",
  problem: "",
  diagnosis: "",
  prescriptions: "",
  notes: "",
};

export const PatientVisitCreator: React.FC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const visitsApi = new PatientVisitsApi();
  const [form, setForm] = useState<FormState>(defaultState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form selection state
  const [forms, setForms] = useState<FormOption[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [formsLoading, setFormsLoading] = useState(false);
  const [formsError, setFormsError] = useState<string | null>(null);

  // Load available forms on component mount
  useEffect(() => {
    const loadForms = async () => {
      setFormsLoading(true);
      setFormsError(null);
      try {
        const response = await fetch("http://localhost:3041/ext/api/forms");
        if (!response.ok) {
          throw new Error(`Failed to load forms: ${response.statusText}`);
        }
        const formsData = await response.json();
        setForms(formsData);
        // Set default selection to first form if available
        if (formsData.length > 0) {
          // setSelectedFormId(formsData[0].value);
        }
      } catch (err) {
        setFormsError(
          err instanceof Error ? err.message : "Failed to load forms"
        );
      } finally {
        setFormsLoading(false);
      }
    };
    loadForms();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setError("Missing patientId");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: Partial<IPatientVisitEntity> = {
        patientId,
        dateOfVisit: new Date(form.dateOfVisit),
        doctorName: form.doctorName,
        problem: form.problem,
        diagnosis: form.diagnosis || undefined,
        prescriptions: form.prescriptions || undefined,
        notes: form.notes || undefined,
      };
      await visitsApi.dataApi.create(payload);
      setSuccess("Visit recorded");
      // Return to patient list after short delay
      setTimeout(() => navigate("/patients"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save visit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={{ span: 12, offset: 1 }} lg={{ span: 12, offset: 2 }}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">New Patient Visit</h3>
            </Card.Header>
            <Card.Body>
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

              <Tabs defaultActiveKey="visit" className="mb-3">
                <Tab eventKey="visit" title="Visit">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date / Time of Visit</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="dateOfVisit"
                        value={form.dateOfVisit}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Doctor Name</Form.Label>
                      <Form.Control
                        name="doctorName"
                        value={form.doctorName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Problem / Chief Complaint</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="problem"
                        value={form.problem}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Diagnosis</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="diagnosis"
                        value={form.diagnosis}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Prescriptions</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="prescriptions"
                        value={form.prescriptions}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-between">
                      <Button
                        variant="secondary"
                        onClick={() => navigate(-1)}
                        disabled={saving}
                      >
                        Back
                      </Button>
                      <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? "Saving..." : "Save Visit"}
                      </Button>
                    </div>
                  </Form>
                </Tab>

                <Tab eventKey="insurance" title="Insurance">
                  {formsError && (
                    <Alert variant="danger" className="mb-3">
                      {formsError}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Select Insurance Form</Form.Label>
                    <Form.Select
                      value={selectedFormId}
                      onChange={(e) => setSelectedFormId(e.target.value)}
                      disabled={formsLoading}
                    >
                      {formsLoading ? (
                        <option>Loading forms...</option>
                      ) : (
                        <>
                          <option value="">Select a form</option>
                          {forms.map((form) => (
                            <option key={form.value} value={form.value}>
                              {form.label}
                            </option>
                          ))}
                        </>
                      )}
                    </Form.Select>
                  </Form.Group>

                  {selectedFormId && (
                    <iframe
                      src={`http://localhost:3040/#/forms/display/${selectedFormId}`}
                      style={{ border: "none", width: "100%", height: "500px" }}
                    />
                  )}

                  {!selectedFormId && !formsLoading && (
                    <div className="text-center text-muted p-4">
                      Please select a form to display
                    </div>
                  )}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
