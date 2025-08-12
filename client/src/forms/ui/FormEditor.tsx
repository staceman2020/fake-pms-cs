import type { Form as FormioForm } from "@formio/core";
//import { FormBuilder as FormioFormBuilder } from "@formio/js";
import { FormBuilder } from "@formio/react";
import React, { use, useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { IFormEntity } from "../../../../common/src/api/database/DatabaseEntities";
import { FormsApi } from "../api/FormsApi";
import { FormBuilder as FormBuilderType } from "@formio/js";

interface FormData {
  name: string;
  description: string;
}

interface UnsavedChangesModalProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  show,
  onConfirm,
  onCancel,
}) => {
  if (!show) return null;

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Unsaved Changes</h5>
          </div>
          <div className="modal-body">
            <p>
              You have unsaved changes. Are you sure you want to leave without
              saving?
            </p>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              Leave Without Saving
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FormEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [form, setForm] = useState<IFormEntity | null>(null);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  const [formSchema, setFormSchema] = useState<object | null>(null);
  const [initialFormSchema, setInitialFormSchema] = useState<object | null>(
    isEditMode ? null : { components: [] }
  );

  // const editedFormInstance = useRef<object | null>(null);

  // Ref to hold the FormBuilder instance
  const builderInstance = useRef<FormBuilderType | null>(null);

  const formsApi = useRef(new FormsApi());

  // FormIO Builder configuration to prevent project settings error
  //   const formBuilderConfig = {
  //     form: formSchema || { display: "form", components: [] },
  //     options: {
  //       noDefaultSubmitButton: false,
  //       language: "en",
  //     },
  //   };

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Watch for changes to mark unsaved changes
  watch();

  useEffect(() => {
    setHasUnsavedChanges(
      isDirty ||
        (formSchema !== null &&
          JSON.stringify(formSchema) !== JSON.stringify(form?.data))
    );
  }, [isDirty, formSchema, form?.data]);

  const loadForm = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await formsApi.current.dataApi.getItem(id);
      const formData = data as IFormEntity;
      setForm(formData);
      setFormSchema(formData.data);
      setInitialFormSchema(formData.data);
      reset({
        name: formData.name,
        description: formData.description,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load form");
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    if (isEditMode) {
      loadForm();
    }
  }, [isEditMode, loadForm]);

  const handleSave = async (data: FormData) => {
    try {
      setSaving(true);
      setError(null);

      console.log("Saving with schema:", formSchema);

      // const submission = formInstance.current?.);
      // console.log("Saving with schema:", submission);

      const formPayload = {
        name: data.name,
        description: data.description,
        data: builderInstance.current?._form || formSchema || {},
      };

      if (isEditMode && id) {
        await formsApi.current.dataApi.update(id, formPayload);
      } else {
        await formsApi.current.dataApi.create(formPayload);
      }

      setHasUnsavedChanges(false);
      navigate("/forms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !id || !form) return;

    if (
      window.confirm(`Are you sure you want to delete the form "${form.name}"?`)
    ) {
      try {
        await formsApi.current.dataApi.delete(id);
        navigate("/forms");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete form");
      }
    }
  };

  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedModal(true);
    } else {
      navigate(path);
    }
  };

  const confirmNavigation = () => {
    setShowUnsavedModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const cancelNavigation = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading form...</p>
      </Container>
    );
  }

  return (
    <>
      <Container className="mt-4">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>{isEditMode ? "Edit Form" : "Create New Form"}</h1>
              <div>
                <Button
                  variant="outline-secondary"
                  className="me-2"
                  onClick={() => handleNavigation("/forms")}
                >
                  Back to Forms
                </Button>
                {hasUnsavedChanges && (
                  <span className="badge bg-warning text-dark me-2">
                    Unsaved Changes
                  </span>
                )}
              </div>
            </div>

            {error && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            {/* Form Metadata */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Form Information</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit(handleSave)}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Form Name *</Form.Label>
                        <Controller
                          name="name"
                          control={control}
                          rules={{ required: "Form name is required" }}
                          render={({ field }) => (
                            <Form.Control
                              {...field}
                              type="text"
                              placeholder="Enter form name"
                              isInvalid={!!errors.name}
                            />
                          )}
                        />
                        {errors.name && (
                          <Form.Control.Feedback type="invalid">
                            {errors.name.message}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <Form.Control
                              {...field}
                              as="textarea"
                              rows={3}
                              placeholder="Enter form description"
                            />
                          )}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-between">
                    <div>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={saving}
                        className="me-2"
                      >
                        {saving ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Saving...
                          </>
                        ) : isEditMode ? (
                          "Update Form"
                        ) : (
                          "Create Form"
                        )}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => handleNavigation("/forms")}
                      >
                        Cancel
                      </Button>
                    </div>
                    {isEditMode && (
                      <Button variant="outline-danger" onClick={handleDelete}>
                        Delete Form
                      </Button>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* FormIO Builder */}
            {initialFormSchema && (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Form Builder</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ minHeight: "400px" }}>
                    {/* FormIO FormBuilder - may need adjustment based on version */}
                    <FormBuilder
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      // {...(formBuilderConfig as any)}
                      initialForm={initialFormSchema as FormioForm}
                      // onChange={(schema: object) => {
                      //   console.log("Schema changed");
                      //   // editedFormInstance.current = schema;
                      // }}
                      onBuilderReady={(instance: FormBuilderType) => {
                        // console.log("Builder is ready", instance);
                        // console.log("Builder is ready", instance._form);
                        builderInstance.current = instance;
                      }}
                      // formInstance.current = instance;
                      // instance.on("change", () => {
                      //   console.log("Form changed");
                      // });
                      // }}
                      //   onBuilderReady={(instance: FormioFormBuilder) => {
                      //     // This callback can be used to perform actions when the builder is ready
                      //     // formBuilderInstance.current = instance;
                      //     //   instance.setForm(
                      //     //     formBuilderConfig.form as unknown as FormioForm
                      //     //   );
                      //   }}
                    />
                  </div>

                  {/* JSON editor as fallback */}
                  <details className="mt-3">
                    <summary>View/Edit JSON Schema</summary>
                    <Form.Group className="mt-2">
                      <Form.Control
                        as="textarea"
                        rows={8}
                        value={JSON.stringify(
                          formSchema || { components: [] },
                          null,
                          2
                        )}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setFormSchema(parsed);
                          } catch {
                            // Invalid JSON, ignore
                          }
                        }}
                        style={{ fontFamily: "monospace", fontSize: "12px" }}
                      />
                    </Form.Group>
                  </details>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      <UnsavedChangesModal
        show={showUnsavedModal}
        onConfirm={confirmNavigation}
        onCancel={cancelNavigation}
      />
    </>
  );
};
