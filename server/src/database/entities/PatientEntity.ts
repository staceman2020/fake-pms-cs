import { Column, Entity } from "typeorm";
import { IPatientEntity } from "../../../../common/src/api/database/DatabaseEntities";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class PatientEntity extends BaseEntity implements IPatientEntity {
  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: "date" })
  dateOfBirth!: Date;

  @Column()
  gender!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: "text", nullable: true })
  address?: string;

  @Column({ unique: true })
  medicalRecordNumber!: string;

  @Column({ nullable: true })
  emergencyContactName?: string;

  @Column({ nullable: true })
  emergencyContactPhone?: string;
}
