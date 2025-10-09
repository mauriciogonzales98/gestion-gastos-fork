import { BaseEntity, Entity, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";
import { ManyToOne } from "@mikro-orm/core";
import { User } from "../User/user.entity.js";

@Entity()
export class Wallet extends BaseEntity{
  @PrimaryKey()
  idWallet!: number;

  @Property ({ nullable: true})
  coin!: string; 

  @Property ({ nullable: true})
  spend!: number;

  @Property ({ nullable: true})
  income!: number;

  @ManyToOne({entity:() => User, nullable: false, fieldName: 'userid'})
  user!: User;
}