import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Tab,
  Table,
  Tabs,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import type {
  IPatientEntity,
  IPatientVisitEntity,
} from "../../../../common/src/api/database/DatabaseEntities";
import { PatientVisitsApi } from "../api/PatientVisitsApi";
import { PatientsApi } from "../api/PatientsApi";
import {
  InsuranceFormsChannel,
  type OnLoadRequest,
} from "./InsuranceFormsChannel";

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

interface ShareableField {
  key: string;
  label: string;
  value: string | undefined;
  checked: boolean;
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
  const patientsApi = useMemo(() => new PatientsApi(), []);
  const [form, setForm] = useState<FormState>(defaultState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form selection state
  const [forms, setForms] = useState<FormOption[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [formsLoading, setFormsLoading] = useState(false);
  const [formsError, setFormsError] = useState<string | null>(null);

  // Patient data and modal state
  const [patient, setPatient] = useState<IPatientEntity | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareableFields, setShareableFields] = useState<ShareableField[]>([]);
  const [currentFormRequest, setCurrentFormRequest] =
    useState<OnLoadRequest | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Load patient data on component mount
  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) return;
      try {
        const patientData = await patientsApi.dataApi.getItem(patientId);
        setPatient(patientData || null);
      } catch (err) {
        console.error("Failed to load patient:", err);
      }
    };
    loadPatient();
  }, [patientId, patientsApi]);

  // Helper function to create shareable fields from patient data
  const createShareableFields = useCallback(
    (patient: IPatientEntity, requestFields: string[]): ShareableField[] => {
      const fieldMapping: Record<
        string,
        { label: string; value: string | undefined }
      > = {
        "client.familyName": {
          label: "Last Name",
          value: patient.lastName,
        },
        "client.firstNames": {
          label: "First Names",
          value: patient.firstName,
        },
        "client.gender": {
          label: "Gender",
          value: patient.gender,
        },
        "client.dateOfBirth": {
          label: "Date of Birth",
          value: patient.dateOfBirth
            ? new Date(patient.dateOfBirth).toLocaleDateString()
            : undefined,
        },
        "client.phone": {
          label: "Phone",
          value: patient.phone,
        },
        "client.address": {
          label: "Address",
          value: patient.address,
        },
      };

      return requestFields
        .filter((field) => fieldMapping[field])
        .map((field) => ({
          key: field,
          label: fieldMapping[field].label,
          value: fieldMapping[field].value,
          checked: true,
        }));
    },
    []
  );

  // Handle select all/unselect all
  const handleSelectAll = (checked: boolean) => {
    setShareableFields((fields) =>
      fields.map((field) => ({ ...field, checked }))
    );
  };

  // Handle individual field checkbox change
  const handleFieldCheck = (key: string, checked: boolean) => {
    setShareableFields((fields) =>
      fields.map((field) => (field.key === key ? { ...field, checked } : field))
    );
  };

  // Handle modal submit
  const handleShareSubmit = () => {
    console.log("Sharing data...");
    if (!currentFormRequest) {
      console.log("Abandoning...");
      return;
    }

    const responseData: Record<string, string | number | boolean> = {};
    shareableFields.forEach((field) => {
      if (field.checked && field.value) {
        responseData[field.key] = field.value;
      }
    });

    // TODO: Send response back to form via channel
    console.log("Sharing data:", responseData);
    if (channel) {
      channel.sendLoadResponse({
        formId: currentFormRequest.formId,
        prepopulated: responseData,
        content: {}, // No existing content to restore
      });
    }

    setShowShareModal(false);
    setCurrentFormRequest(null);
  };

  // Handle modal cancel
  const handleShareCancel = () => {
    setShowShareModal(false);
    setCurrentFormRequest(null);
  };

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

  const channel = useMemo(() => {
    return new InsuranceFormsChannel({
      onLoadRequest: (request: OnLoadRequest) => {
        console.log("Form requesting data:", request);

        if (!patient) {
          console.warn("Patient data not available");
          return;
        }
        if (!iframeRef.current) {
          console.warn("Iframe reference not available");
          return;
        }

        // Create shareable fields based on request
        const fields = createShareableFields(patient, request.fields);

        console.log("Shareable fields:", fields);

        if (fields.length > 0) {
          setShareableFields(fields);
          setCurrentFormRequest(request);
          setShowShareModal(true);
        }
      },
    });
  }, [patient, createShareableFields, iframeRef]);

  // const channel = useMemo(() => {

  // }, [patient, createShareableFields, iframeRef]);

  useEffect(() => {
    console.log("IFrame Appeared", iframeRef.current != undefined);
  }, [iframeRef]);

  // Initialize the channel when component mounts
  useEffect(() => {
    // Channel is automatically initialized via useMemo
    console.log("Insurance forms channel initialized");
    return () => {
      // Cleanup if needed
    };
  }, [channel]);
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
                      style={{
                        border: "none",
                        width: "100%",
                        height: "500px",
                        minHeight: "70vh",
                      }}
                      ref={iframeRef}
                      onLoad={() => {
                        console.log("IFrame Loaded", iframeRef.current);
                        // iFrameLoadHandler();
                      }}
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

      {/* Share Information Modal */}
      <Modal show={showShareModal} onHide={handleShareCancel} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Share Information With Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            The form is requesting information to share
          </Alert>

          {shareableFields.length > 0 && (
            <>
              <div className="mb-3">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleSelectAll(true)}
                >
                  Select All
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleSelectAll(false)}
                >
                  Unselect All
                </Button>
              </div>

              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Share</th>
                    <th>Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {shareableFields.map((field) => (
                    <tr key={field.key}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={field.checked}
                          onChange={(e) =>
                            handleFieldCheck(field.key, e.target.checked)
                          }
                        />
                      </td>
                      <td>{field.label}</td>
                      <td>{field.value || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}

          {shareableFields.length === 0 && (
            <p className="text-muted">
              No matching patient information found for the requested fields.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleShareCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleShareSubmit}
            disabled={shareableFields.length === 0}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
