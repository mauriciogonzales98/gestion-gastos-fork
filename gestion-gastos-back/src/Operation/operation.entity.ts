import { Entity, PrimaryKey, Property, ManyToOne, Unique } from '@mikro-orm/core';
import { User } from '../User/user.entity.js';
import { Category } from '../Category/category.entity.js';
import { Wallet } from '../Wallet/wallet.entity.js';

@Entity()
@Unique({ properties: ['user', 'externalId'] })
export class Operation {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Property()
  description!: string;

  @Property()
  date!: Date;

  @Property()
  type!: string;

  @ManyToOne(() => Wallet, { fieldName: 'walletid' })
  wallet!: Wallet;

  @ManyToOne(() => Category, { fieldName: 'categoryid', nullable: true })
  category!: Category;

  @ManyToOne(() => User, { fieldName: 'userid' })
  user!: User;

  @Property({ fieldName: 'external_id', nullable: true })
  externalId?: string;

  @Property({ fieldName: 'sync_source', nullable: true })
  syncSource?: string;

  @Property({ fieldName: 'payment_method', nullable: true })
  paymentMethod?: string;

  @Property({ nullable: true })
  status?: string;

  constructor(amount: number, description: string, date: Date, type: string, wallet: Wallet, category: Category, user: User) {
    this.amount = amount;
    this.description = description;
    this.date = date;
    this.type = type;
    this.wallet = wallet;
    this.category = category;
    this.user = user;
  }
}