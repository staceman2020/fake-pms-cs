import { RepoApiEndpointRegistry } from "../../../../common/src/api/database/DatabaseApiEndpointRegistry";
import { EntityApiClient } from "../../database/api/EntityApiClient";
import type { IPatientEntity } from "../../../../common/src/api/database/DatabaseEntities";

export class PatientsApi {
  public dataApi = new EntityApiClient<IPatientEntity>(
    RepoApiEndpointRegistry.PATIENT
  );
}
