import { DatabaseApiEndpoints } from "./DatabaseApiEndpoints";

export class RepoApiEndpointRegistry {
  static FORM_INSTANCE = new DatabaseApiEndpoints("form-instances");
  static FORM = new DatabaseApiEndpoints("forms");
  static PATIENT = new DatabaseApiEndpoints("patients");
}
