import { BaseEntity, DateTimeType, Entity, ManyToOne, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";
import { User } from "../User/user.entity.js";
import { Category } from "../Category/category.entity.js";
import { Tag } from "../Tag/tag.entity.js";
import { Wallet } from "../Wallet/wallet.entity.js";

@Entity()
export class Operation extends BaseEntity{
  @PrimaryKey()
  id!: number;

  @Property ({ nullable: true})
  amount!: number; 

  @Property ({ nullable: true})
 date!: Date; //Revisar si es DateTimeType o Date

  @Property ({ nullable: true})
  description!: string;

  @ManyToOne({entity: () => User, nullable: false})
  user!: User;

  @ManyToOne({entity: () => Category, nullable: true})
  category!: Category;

  @ManyToOne({entity: () => Tag, nullable: true})
  tag!: Tag;

  @ManyToOne({entity: () => Wallet, nullable: true})
  wallet!: Wallet;
}