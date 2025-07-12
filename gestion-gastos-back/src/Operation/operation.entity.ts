import { BaseEntity, DateTimeType, Entity, ManyToOne, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";
import { User } from "../usuario/user.entity";
import { Category } from "../Category/category.entity";
import { Tag } from "../Tag/tag.entity";
import { Wallet } from "../Wallet/wallet.entity";

@Entity()
export class Operation extends BaseEntity{
  @PrimaryKey()
  idOperation!: number;

  @Property ({ nullable: true})
  operationAmount!: number; 

  @Property ({ nullable: true})
  operationDate!: Date; //Revisar si es DateTimeType o Date

  @Property ({ nullable: true})
  operationDescription!: string;

  @ManyToOne({entity: () => User, nullable: false})
  user!: User;

  @ManyToOne({entity: () => Category, nullable: true})
  category!: Category;

  @ManyToOne({entity: () => Tag, nullable: true})
  tag!: Tag;

  @ManyToOne({entity: () => Wallet, nullable: true})
  wallet!: Wallet;
}