import { BaseEntity, Entity, ManyToOne, OneToMany, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";
import { User } from "../User/user.entity.js";
import { Operation } from "../Operation/operation.entity.js";
import { Collection } from "@mikro-orm/core";

@Entity()
export class Category {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: false })
  name!: string;

  @Property({ nullable: true })
  icon!: string;

  @Property({ nullable: true })
  description!: string;

  @ManyToOne({
    entity: () => User,
    nullable: false,
    fieldName: "userid",
    deleteRule: "cascade",
    updateRule: "cascade",
  })
  user!: User;

  @OneToMany('Operation', 'category')
  operations = new Collection<Operation>(this);

}