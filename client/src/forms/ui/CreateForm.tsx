import React from "react";
import { FormEditor } from "./FormEditor";

// This component is a simple wrapper for FormEditor in create mode
// The FormEditor component handles both create and edit modes based on the presence of an ID parameter
export const CreateForm: React.FC = () => {
  return <FormEditor />;
};
