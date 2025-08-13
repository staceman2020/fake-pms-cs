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

export interface IPatientEntity extends IRepoBaseEntity {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  medicalRecordNumber: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface IPatientVisitEntity extends IRepoBaseEntity {
  patientId: string; // Reference to patient
  dateOfVisit: Date;
  doctorName: string;
  problem: string; // Chief complaint / reason for visit
  diagnosis?: string; // Diagnosis details
  prescriptions?: string; // Text or serialized JSON of prescriptions
  notes?: string; // Additional notes
}
