import { BaseEntity, Entity, PrimaryKey, DateTimeType, Property, ManyToOne, Unique, Enum } from '@mikro-orm/core';
import { User } from '../User/user.entity.js';
import { Category } from '../Category/category.entity.js';
import { Wallet } from '../Wallet/wallet.entity.js';
import { Tag } from '../Tag/tag.entity.js';

export enum OperationType {
  GASTO = "gasto",
  INGRESO = "ingreso",
}

// @Unique({ properties: ['user', 'externalId'] })
@Entity()
export class Operation {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Property()
  description!: string;

  @Enum({
    items: () => OperationType,
    default: OperationType.GASTO,
    nullable: false,
  })
  type!: OperationType;

  @Property({ type: DateTimeType, nullable: true })
  date!: Date;

  @ManyToOne(() => Wallet, { fieldName: 'walletid' })
  wallet!: Wallet;

  @ManyToOne(() => Category, { fieldName: 'categoryid', nullable: true })
  category!: Category;

  @Property({ fieldName: 'external_id', nullable: true })
  externalId?: string;

  @Property({ fieldName: 'sync_source', nullable: true })
  syncSource?: string;

  @Property({ fieldName: 'payment_method', nullable: true })
  paymentMethod?: string;

  @Property({ nullable: true })
  status?: string;
  @ManyToOne({
    entity: () => Tag,
    nullable: true,
    fieldName: "tagid",
    deleteRule: "set null",
    updateRule: "cascade",
  })
  tagid?: Tag;

  @ManyToOne({
    entity: () => Wallet,
    nullable: false,
    deleteRule: "cascade",
    updateRule: "cascade",
    fieldName: "walletid",
  })
  walletid!: Wallet;

  @ManyToOne(() => User, { fieldName: 'userid' })
  user!: User;

  constructor(amount: number, description: string, date: Date, type: OperationType, wallet: Wallet, category: Category, user: User) {
    this.amount = amount;
    this.description = description;
    this.date = date;
    this.type = type;
    this.wallet = wallet;
    this.category = category;
    this.user = user;
  }
}