// // backend/entities/EmailChangeProcess.ts
// import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
// import { ProcessStatus, ProcessStep } from "./EmailChange.types.js";

// @Entity()
// export class EmailChangeProcess {
//   @PrimaryKey()
//   id!: string;

//   @Property()
//   userId!: string;

//   @Property()
//   oldEmail!: string;

//   @Property()
//   newEmail!: string;

//   @Property()
//   status: ProcessStatus = "pending";

//   @Property()
//   step: ProcessStep = "initialized";

//   @Property({ nullable: true })
//   error?: string;

//   @Property()
//   createdAt: Date = new Date();

//   @Property({ onUpdate: () => new Date() })
//   updatedAt: Date = new Date();

//   constructor(userId: string, oldEmail: string, newEmail: string) {
//     this.id = this.generateId();
//     this.userId = userId;
//     this.oldEmail = oldEmail;
//     this.newEmail = newEmail;
//   }

//   private generateId(): string {
//     return `ecp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   }

//   markLocalUpdateStarted(): this {
//     this.step = "local_update_started";
//     this.updatedAt = new Date();
//     return this;
//   }

//   markLocalUpdateCompleted(): this {
//     this.step = "local_update_completed";
//     this.updatedAt = new Date();
//     return this;
//   }

//   markAuthUpdateStarted(): this {
//     this.step = "auth_update_started";
//     this.updatedAt = new Date();
//     return this;
//   }

//   markAuthUpdateCompleted(): this {
//     this.step = "auth_update_completed";
//     this.status = "completed";
//     this.updatedAt = new Date();
//     return this;
//   }

//   markRunning(): this {
//     this.status = "running";
//     this.updatedAt = new Date();
//     return this;
//   }

//   markFailed(error: Error): this {
//     this.status = "failed";
//     this.error = error.message;
//     this.updatedAt = new Date();
//     return this;
//   }

//   markCompensating(): this {
//     this.status = "compensating";
//     this.step = "compensation_started";
//     this.updatedAt = new Date();
//     return this;
//   }

//   markCompensationCompleted(): this {
//     this.step = "compensation_completed";
//     this.updatedAt = new Date();
//     return this;
//   }

//   markCompensationFailed(error: Error): this {
//     this.status = "compensation_failed";
//     this.error = `Original: ${this.error} | Compensation: ${error.message}`;
//     this.updatedAt = new Date();
//     return this;
//   }
// }
