import { Form as FormioForm } from "@formio/react";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Accordion,
} from "react-bootstrap";
import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { RepoApiEndpointRegistry } from "../../../../common/src/api/database/DatabaseApiEndpointRegistry";
import type {
  IFormEntity,
  IFormInstanceEntity,
} from "../../../../common/src/api/database/DatabaseEntities";
import { useUser } from "../../UserHook";
import { EntityApiClient } from "../../database/api/EntityApiClient";
import { SendFormByEmail } from "./SendFormByEmail";

export const FillForm: React.FC = () => {
  const { username } = useUser();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const instanceId = searchParams.get("instance");
  const isViewRoute = location.pathname.includes("/view/");
  const [forms, setForms] = useState<IFormEntity[]>([]);
  const [selected, setSelected] = useState<IFormEntity | null>(null);
  const [instance, setInstance] = useState<IFormInstanceEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draftMsg, setDraftMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [showDataView, setShowDataView] = useState(false);
  const navigate = useNavigate();

  const formsApi = useMemo(
    () => new EntityApiClient<IFormEntity>(RepoApiEndpointRegistry.FORM),
    []
  );
  const instanceApi = useMemo(
    () =>
      new EntityApiClient<IFormInstanceEntity>(
        RepoApiEndpointRegistry.FORM_INSTANCE
      ),
    []
  );

  useEffect(() => {
    if (!username) return;
    setLoading(true);

    if (id && instanceId) {
      // Load specific form instance
      Promise.all([formsApi.getItem(id), instanceApi.getItem(instanceId)])
        .then(([form, inst]) => {
          setSelected(form as IFormEntity);
          setInstance(inst as IFormInstanceEntity);
          setFormData(inst.data || {});
          setForms([form as IFormEntity]);
        })
        .catch((err) =>
          setError(
            err instanceof Error ? err.message : "Failed to load form instance"
          )
        )
        .finally(() => setLoading(false));
    } else if (id) {
      // If ID is provided in URL, load that specific form
      formsApi
        .getItem(id)
        .then((form) => {
          setSelected(form as IFormEntity);
          setForms([form as IFormEntity]);
        })
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Failed to load form")
        )
        .finally(() => setLoading(false));
    } else {
      // Otherwise, load all forms for selection
      formsApi
        .list()
        .then((data) => setForms(data as IFormEntity[]))
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Failed to load forms")
        )
        .finally(() => setLoading(false));
    }
  }, [username, id, instanceId, formsApi, instanceApi]);
  const handleSelect = (id: string) => {
    setSelected(forms.find((f) => f.id === id) || null);
    setFormData({});
    setDraftMsg(null);
  };

  const handleSaveDraft = async () => {
    if (!selected || !username) return;
    setSaving(true);
    try {
      if (instance) {
        // Update existing instance
        await instanceApi.update(instance.id, {
          ...instance,
          data: { ...formData, submitted: false },
        });
      } else {
        // Create new instance
        await instanceApi.create({
          formId: selected.id,
          userId: username,
          data: { ...formData, submitted: false },
        });
      }
      setDraftMsg("Draft saved!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (submission: {
    data: Record<string, unknown>;
  }) => {
    if (!selected || !username) return;
    setSaving(true);
    try {
      if (instance) {
        // Update existing instance
        await instanceApi.update(instance.id, {
          ...instance,
          data: { ...submission.data, submitted: true },
        });
      } else {
        // Create new instance
        await instanceApi.create({
          formId: selected.id,
          userId: username,
          data: { ...submission.data, submitted: true },
        });
      }
      setDraftMsg("Form submitted!");
      setTimeout(() => navigate("/myforms"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  if (!username)
    return <Alert variant="warning">Please log in to fill out forms.</Alert>;

  const isReadOnly = (instance?.data?.submitted && isViewRoute) || isViewRoute;
  const isViewMode = instanceId && isReadOnly;

  return (
    <Container className="mt-4">
      <Row>
        {!id && (
          <Col md={4}>
            <h4>Select a Form</h4>
            <Form.Select
              onChange={(e) => handleSelect(e.target.value)}
              value={selected?.id || ""}
            >
              <option value="">-- Choose a form --</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Form.Select>
          </Col>
        )}
        <Col md={id ? 12 : 8}>
          {selected && (
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {selected.name}
                    {isViewMode && (
                      <span className="ms-2 badge bg-secondary">Read Only</span>
                    )}
                  </div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowDataView(!showDataView)}
                  >
                    {showDataView ? "Hide Data" : "Show Data"}
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {draftMsg && <Alert variant="success">{draftMsg}</Alert>}
                <FormioForm
                  src={selected.data}
                  submission={{ data: formData as Record<string, any> }}
                  onChange={(e) => setFormData(e.data)}
                  onSubmit={handleSubmit}
                  options={{ readOnly: isReadOnly }}
                />

                {showDataView && (
                  <Card className="mt-3">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">Form Data (JSON)</h6>
                    </Card.Header>
                    <Card.Body>
                      <pre
                        style={{
                          backgroundColor: "#f8f9fa",
                          padding: "15px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          maxHeight: "300px",
                          overflow: "auto",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {Object.keys(formData).length > 0
                          ? JSON.stringify(formData, null, 2)
                          : "// No data entered yet"}
                      </pre>
                    </Card.Body>
                  </Card>
                )}

                {!isReadOnly && (
                  <div className="mt-2">
                    <Button
                      className="me-2"
                      onClick={handleSaveDraft}
                      disabled={saving}
                      variant="secondary"
                    >
                      Save as Draft
                    </Button>
                    {selected && instance && (
                      <SendFormByEmail
                        form={selected}
                        formInstanceId={instance.id}
                        hasPartialData={Object.keys(formData).length > 0}
                        disabled={saving}
                        buttonText="Share via Email"
                      />
                    )}
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
