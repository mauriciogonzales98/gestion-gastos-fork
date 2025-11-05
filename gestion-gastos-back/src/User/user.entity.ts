// User.entity.ts
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

  // Campos nuevos para Mercado Pago
  @Property({ nullable: true })
  mpAccessToken?: string;

  @Property({ nullable: true })
  mpRefreshToken?: string;

  @Property({ nullable: true })
  mpTokenExpiresAt?: Date;

  @Property({ nullable: true })
  mpUserId?: string;

  @Property({ nullable: true })
  lastSyncAt?: Date;

  static createFromFirebase(firebaseUid: string, email: string, name: string, surname: string): User {
    const user = new User();
    user.id = firebaseUid;
    user.email = email;
    user.name = name;
    user.surname = surname;
    
    return user;
  }

  // Método helper para verificar si la conexión con MP está activa
  isMercadoPagoConnected(): boolean {
    return !!(this.mpAccessToken && this.mpTokenExpiresAt && new Date() < this.mpTokenExpiresAt);
  }

  // Método para actualizar tokens de MP
  updateMercadoPagoTokens(accessToken: string, refreshToken: string, expiresIn: number, mpUserId?: string): void {
    this.mpAccessToken = accessToken;
    this.mpRefreshToken = refreshToken;
    this.mpUserId = mpUserId;
    
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    this.mpTokenExpiresAt = expiresAt;
  }

  // Método para marcar última sincronización
  markLastSync(): void {
    this.lastSyncAt = new Date();
  }
}