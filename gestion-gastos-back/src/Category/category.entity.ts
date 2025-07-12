import { BaseEntity, Entity, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";

@Entity()
export class Category extends BaseEntity{
  @PrimaryKey()
  categoryId!: number;

  @Property ({ nullable: true})
  categoryName!: string; 

  @Property ({ nullable: true})
  categoryIcon!: string;

  @Property ({ nullable: true})
  categoryDescription!: string;

}
