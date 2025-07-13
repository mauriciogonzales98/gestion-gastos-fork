import { BaseEntity, Entity, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";

@Entity()
export class Category extends BaseEntity{
  @PrimaryKey()
  id!: number;

  @Property ({ nullable: false})
  name!: string; 

  @Property ({ nullable: true})
  icon!: string;

  @Property ({ nullable: true})
  description!: string;

}
