// backend/entities/RegistrationProcess.ts
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import {
  ProcessStatus,
  ProcessStep,
} from "../Registration/registrationProcess.types.js";

@Entity()
export class RegistrationProcess {
  @PrimaryKey()
  id!: string;

  @Property()
  email!: string;

  @Property()
  name!: string;

  @Property()
  surname!: string;

  @Property({ nullable: true })
  authCreated?: boolean;

  @Property({ nullable: true })
  userId?: string;

  @Property()
  status: ProcessStatus = "pending";

  @Property()
  step: ProcessStep = "initialized";

  @Property({ nullable: true })
  error?: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(email: string, name: string, surname: string) {
    this.id = this.generateId();
    this.email = email;
    this.name = name;
    this.surname = surname;
  }

  private generateId(): string {
    return `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  markAuthCreationStarted(): this {
    this.step = "auth_creation_started";
    this.updatedAt = new Date();
    return this;
  }

  markAuthCreationCompleted(userId: string): this {
    this.step = "auth_creation_completed";
    this.authCreated = true;
    this.userId = userId;
    this.updatedAt = new Date();
    return this;
  }

  markUserCreationStarted(): this {
    this.step = "user_creation_started";
    this.updatedAt = new Date();
    return this;
  }

  markUserCreationCompleted(userId: string): this {
    this.step = "user_creation_completed";
    this.status = "completed";
    this.userId = userId;
    this.updatedAt = new Date();
    return this;
  }

  markRunning(): this {
    this.status = "running";
    this.updatedAt = new Date();
    return this;
  }

  markFailed(error: Error): this {
    this.status = "failed";
    this.error = error.message;
    this.updatedAt = new Date();
    return this;
  }

  markCompensating(): this {
    this.status = "compensating";
    this.step = "compensation_started";
    this.updatedAt = new Date();
    return this;
  }

  markCompensationCompleted(): this {
    this.step = "compensation_completed";
    this.updatedAt = new Date();
    return this;
  }

  markCompensationFailed(error: Error): this {
    this.status = "compensation_failed";
    this.error = `Original: ${this.error} | Compensation: ${error.message}`;
    this.updatedAt = new Date();
    return this;
  }
}
