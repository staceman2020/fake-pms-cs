import { Column, Entity, JsonContains } from "typeorm";
import { IPatientVisitEntity } from "../../../../common/src/api/database/DatabaseEntities";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class PatientVisitEntity
  extends BaseEntity
  implements IPatientVisitEntity
{
  @Column()
  patientId!: string; // Simple foreign key reference

  @Column({ type: "datetime" })
  dateOfVisit!: Date;

  @Column()
  doctorName!: string;

  @Column({ type: "text" })
  problem!: string;

  @Column({ type: "text", nullable: true })
  diagnosis?: string;

  @Column({ type: "text", nullable: true })
  prescriptions?: string;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @Column({ type: "json" })
  insuranceForms?: object;
}
