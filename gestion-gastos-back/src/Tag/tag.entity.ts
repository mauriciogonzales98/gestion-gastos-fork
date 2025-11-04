// src/entities/tag.entity.ts
import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { User } from "../User/user.entity.js";

@Entity()
export class Tag {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: false })
  name!: string;

  @Property({ nullable: false })
  color!: string;

  @ManyToOne({
    entity: () => User,
    nullable: false,
    fieldName: "userid",
    deleteRule: "cascade",
    updateRule: "cascade",
  })
  user!: User;
}