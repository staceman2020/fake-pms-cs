import { Column, Entity } from "typeorm";
import { IFormInstanceEntity } from "../../../../common/src/api/database/DatabaseEntities";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class FormInstanceEntity
  extends BaseEntity
  implements IFormInstanceEntity
{
  @Column()
  formId!: string;

  @Column()
  userId!: string;

  @Column({ type: "json" })
  data: any;
}
