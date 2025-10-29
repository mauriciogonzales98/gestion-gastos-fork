import { BaseEntity, Entity, PrimaryKey } from "@mikro-orm/core";
import { Property } from "@mikro-orm/core";

@Entity()
export class User extends BaseEntity {
  @PrimaryKey()
  id!: string;

  @Property({ nullable: true })
  name!: string;

  @Property({ nullable: true })
  surname!: string;

  @Property({ nullable: false, unique: true })
  email!: string;

  static createFromFirebase(
    firebaseUid: string,
    email: string,
    name: string,
    surname: string
  ): User {
    const user = new User();
    user.id = firebaseUid;
    user.email = email;
    user.name = name;
    user.surname = surname;
    return user;
  }
}
