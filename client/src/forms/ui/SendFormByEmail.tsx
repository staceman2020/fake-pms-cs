import React from "react";
import { Button } from "react-bootstrap";
import type { IFormEntity } from "../../../../common/src/api/database/DatabaseEntities";

interface SendFormByEmailProps {
  form: IFormEntity;
  formInstanceId?: string;
  variant?: string;
  size?: "sm" | "lg";
  className?: string;
  buttonText?: string;
  hasPartialData?: boolean;
  disabled?: boolean;
  title?: string;
}

export const SendFormByEmail: React.FC<SendFormByEmailProps> = ({
  form,
  variant = "outline-info",
  formInstanceId,
  size,
  className,
  buttonText = "Invite",
  hasPartialData = false,
  disabled = false,
  title,
}) => {
  const handleInviteByEmail = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    let formUrl = `${baseUrl}#/forms/fill/${form.id}`;
    if (formInstanceId) {
      formUrl += `?instanceId=${formInstanceId}`;
    }

    const formStatus = hasPartialData ? "partially completed" : "new";

    const subject = `Invitation to complete form: ${form.name}`;
    const body = `Hello,

You have been invited to complete the following ${formStatus} form:

Form: ${form.name}
${form.description ? `Description: ${form.description}` : ""}
${
  hasPartialData
    ? `\nThis form has been partially filled out and requires completion.`
    : ""
}

Please click the link below to access and fill out the form:
${formUrl}

Thank you!`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const defaultTitle = hasPartialData
    ? "Share this partially completed form via email"
    : "Send email invitation to complete this form";

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleInviteByEmail}
      disabled={disabled}
      title={title || defaultTitle}
    >
      {buttonText}
    </Button>
  );
};
