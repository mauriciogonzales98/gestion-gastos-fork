import { BaseEntity, Entity, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";


@Entity()
export class Usuario extends BaseEntity{
  @PrimaryKey()
  id!: number;

  @Property ({ nullable: false})
  nombre!: string; 

  @Property ({ nullable: false})
  apellido!: string;

}