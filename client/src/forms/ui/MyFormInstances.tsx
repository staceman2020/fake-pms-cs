import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { RepoApiEndpointRegistry } from "../../../../common/src/api/database/DatabaseApiEndpointRegistry";
import type {
  IFormInstanceEntity,
  IFormEntity,
} from "../../../../common/src/api/database/DatabaseEntities";
import { useUser } from "../../UserHook";
import { EntityApiClient } from "../../database/api/EntityApiClient";

export const MyFormInstances: React.FC = () => {
  const { username } = useUser();
  const [instances, setInstances] = useState<IFormInstanceEntity[]>([]);
  const [forms, setForms] = useState<IFormEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const navigate = useNavigate();
  const api = new EntityApiClient<IFormInstanceEntity>(
    RepoApiEndpointRegistry.FORM_INSTANCE
  );
  const formsApi = new EntityApiClient<IFormEntity>(
    RepoApiEndpointRegistry.FORM
  );

  useEffect(() => {
    if (!username) return;
    setLoading(true);

    // Load both instances and forms
    Promise.all([api.findByField("userId", username), formsApi.list()])
      .then(([instancesData, formsData]) => {
        setInstances(instancesData as IFormInstanceEntity[]);
        setForms(formsData as IFormEntity[]);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [username]);

  const getFormName = (formId: string) => {
    const form = forms.find((f) => f.id === formId);
    return form ? form.name : formId;
  };

  const filtered = instances.filter((inst) => {
    if (filter === "all") return true;
    if (filter === "draft") return !inst.data?.submitted;
    if (filter === "submitted") return !!inst.data?.submitted;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    const aDate = new Date(a.updatedAt).getTime();
    const bDate = new Date(b.updatedAt).getTime();
    return sort === "desc" ? bDate - aDate : aDate - bDate;
  });

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2>My Form Instances</h2>
          <div className="d-flex mb-3 align-items-center">
            <Form.Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: 180, marginRight: 10 }}
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
            </Form.Select>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setSort((s) => (s === "desc" ? "asc" : "desc"))}
            >
              Sort by Date {sort === "desc" ? "▼" : "▲"}
            </Button>
          </div>
          {loading ? <Spinner animation="border" /> : null}
          {error && <Alert variant="danger">{error}</Alert>}
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Form Name</th>
                <th>Status</th>
                <th>Last Modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((inst) => (
                <tr key={inst.id}>
                  <td>
                    <strong>{getFormName(inst.formId)}</strong>
                  </td>
                  <td>{inst.data?.submitted ? "Submitted" : "Draft"}</td>
                  <td>{new Date(inst.updatedAt).toLocaleString()}</td>
                  <td>
                    <Button
                      size="sm"
                      variant={
                        inst.data?.submitted ? "outline-secondary" : "primary"
                      }
                      onClick={() =>
                        navigate(
                          inst.data?.submitted
                            ? `/forms/view/${inst.formId}?instance=${inst.id}`
                            : `/forms/fill/${inst.formId}?instance=${inst.id}`
                        )
                      }
                    >
                      {inst.data?.submitted ? "View" : "Edit"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};
