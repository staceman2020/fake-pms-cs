import { RepoApiEndpointRegistry } from "../../../../common/src/api/database/DatabaseApiEndpointRegistry";
import { EntityApiClient } from "../../database/api/EntityApiClient";

export class FormsApi {
  public dataApi = new EntityApiClient(RepoApiEndpointRegistry.FORM);
}
