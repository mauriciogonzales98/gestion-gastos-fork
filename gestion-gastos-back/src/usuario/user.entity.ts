import { BaseEntity, Entity, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";

@Entity()
export class Usuario extends BaseEntity{
  @PrimaryKey()
  idUsuario!: number;

  @Property ({ nullable: true})
  nombre!: string; 

  @Property ({ nullable: true})
  apellido!: string;

  @Property ({ nullable: true})
  email!: string;

  @Property ({ nullable: true})
  password!: string;

}