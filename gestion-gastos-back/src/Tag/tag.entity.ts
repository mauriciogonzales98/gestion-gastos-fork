// create table if not exists `gestion_gastos`.`tag` (
//   `tagId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
//   `tagName` VARCHAR(50) NULL UNIQUE,
//   `userId` INT UNSIGNED NOT NULL,
//   PRIMARY KEY (`tagId`),
//   FOREIGN KEY (`userId`) REFERENCES `user`(`userId`)
// );
import { BaseEntity, Entity, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";

@Entity()
export class Tag extends BaseEntity{
  @PrimaryKey()
  tagId!: number;

  @Property ({ nullable: false})
  tagName!: string; 

  @Property ({ nullable: false})
  userId!: number;

  @Property ({ nullable: true})
  categoryDescription!: string;

}
