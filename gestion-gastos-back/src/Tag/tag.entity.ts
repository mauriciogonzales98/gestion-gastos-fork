// create table if not exists `gestion_gastos`.`tag` (
//   `tagId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
//   `tagName` VARCHAR(50) NULL UNIQUE,
//   `userId` INT UNSIGNED NOT NULL,
//   PRIMARY KEY (`tagId`),
//   FOREIGN KEY (`userId`) REFERENCES `user`(`userId`)
// );
import { BaseEntity, Entity, ManyToOne, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";
import { User } from "../User/user.entity.js";

@Entity()
export class Tag extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: false })
  name!: string;

  @ManyToOne({
    entity: () => User,
    nullable: false,
    deleteRule: "cascade",
    updateRule: "cascade",
  })
  user!: User;
}
