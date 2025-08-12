export interface IRepoBaseEntity {
  id: string; // Unique identifier for the entity
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface IFormEntity extends IRepoBaseEntity {
  name: string;
  description: string;
  data: any;
}

export interface IFormInstanceEntity extends IRepoBaseEntity {
  formId: string; // The form this is based on
  data: any; // The data in the form
  userId: string; // The user who filled out the form
}
