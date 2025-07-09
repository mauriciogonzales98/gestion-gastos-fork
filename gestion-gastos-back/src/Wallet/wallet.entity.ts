import { BaseEntity, Entity, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";

@Entity()
export class Wallet extends BaseEntity{
  @PrimaryKey()
  idWallet!: number;

  @Property ({ nullable: true})
  coin!: string; 

  @Property ({ nullable: true})
  totalSpend!: number;

  @Property ({ nullable: true})
  totalIncome!: number;
}