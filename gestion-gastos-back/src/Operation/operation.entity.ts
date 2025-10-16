import { BaseEntity, DateTimeType, Entity, ManyToOne, PrimaryKey, Enum } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";
import { User } from "../User/user.entity.js";
import { Category } from "../Category/category.entity.js";
import { Tag } from "../Tag/tag.entity.js";
import { Wallet } from "../Wallet/wallet.entity.js";

export enum OperationType {
  GASTO = 'gasto',
  INGRESO = 'ingreso'
}

@Entity()
export class Operation extends BaseEntity{
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  amount!: number; 

  @Property({ type: DateTimeType, nullable: true })
  date!: Date;

  @Property({ nullable: true })
  description!: string;

  @Enum({ 
    items: () => OperationType, 
    default: OperationType.GASTO,
    nullable: false 
  })
  type!: OperationType;

  @ManyToOne({ entity: () => User, 
    nullable: false,
    deleteRule: 'cascade',
    updateRule: 'cascade',
    fieldName: 'userid'})
  user!: User;

  @ManyToOne({ entity: () => Category, 
    nullable: true,
    deleteRule: 'cascade',
    updateRule: 'cascade',
    fieldName: 'categoryid'})
  category!: Category;

  @ManyToOne({ entity: () => Tag, 
    nullable: true,
    deleteRule: 'cascade',
    updateRule: 'cascade',
    fieldName: 'tagid'})
  tag!: Tag;

  @ManyToOne({ entity: () => Wallet, 
    nullable: false,
    deleteRule: 'cascade',
    updateRule: 'cascade',
    fieldName: 'walletid'})
  wallet!: Wallet;
}