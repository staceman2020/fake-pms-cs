import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm";

import { BaseEntity } from "./BaseEntity";
import { IFormEntity } from "../../../../common/src/api/database/DatabaseEntities";

@Entity()
export class FormEntity extends BaseEntity implements IFormEntity {
  @Column()
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "json" })
  data: any;
}
