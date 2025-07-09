import { BaseEntity, DateTimeType, Entity, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";

// `idMovimiento` INT UNSIGNED NOT NULL AUTO_INCREMENT,
//   `montoMovimiento` DECIMAL(10, 2) NOT NULL,
//   `fechaMovimiento` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   `descripcionMovimiento` VARCHAR(100) NULL,
//Traducimos Movimiento a Operation

@Entity()
export class Operation extends BaseEntity{
  @PrimaryKey()
  idOperation!: number;

  @Property ({ nullable: true})
  amoutOperation!: number; 

  @Property ({ nullable: true})
  dateOperation!: Date; //Revisar si es DateTimeType o Date

  @Property ({ nullable: true})
  descriptionOperation!: string;

}