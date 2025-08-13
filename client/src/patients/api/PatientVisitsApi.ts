import { RepoApiEndpointRegistry } from "../../../../common/src/api/database/DatabaseApiEndpointRegistry";
import { EntityApiClient } from "../../database/api/EntityApiClient";
import type { IPatientVisitEntity } from "../../../../common/src/api/database/DatabaseEntities";

export class PatientVisitsApi {
  public dataApi = new EntityApiClient<IPatientVisitEntity>(
    RepoApiEndpointRegistry.PATIENT_VISIT
  );
}
