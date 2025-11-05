// Operation.entity.ts - agregar estos campos
import { Entity, PrimaryKey, Property, ManyToOne, Unique } from '@mikro-orm/core';
import { User } from '../User/user.entity.js';
import { Category } from '../Category/category.entity.js';
import { Wallet } from '../Wallet/wallet.entity.js';

@Entity()
@Unique({ properties: ['user', 'externalId'] })
export class Operation {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Property()
  description!: string;

  @Property()
  date!: Date;

  @Property()
  type!: string; // 'income' o 'expense'

  @ManyToOne(() => Wallet)
  wallet!: Wallet;

  @ManyToOne(() => Category)
  category!: Category;

  @ManyToOne(() => User)
  user!: User;

  // Campos nuevos para Mercado Pago
  @Property({ nullable: true })
  externalId?: string;

  @Property({ nullable: true })
  syncSource?: string; // 'manual' o 'mercado_pago'

  @Property({ nullable: true })
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