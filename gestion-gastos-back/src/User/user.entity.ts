import { BaseEntity, Entity, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";

@Entity()
export class User extends BaseEntity{
  @PrimaryKey()
  userId!: number;

  @Property ({ nullable: true})
  name!: string; 

  @Property ({ nullable: true})
  surname!: string;

  @Property ({ nullable: true})
  email!: string;

  @Property ({ nullable: true})
  password!: string;

}