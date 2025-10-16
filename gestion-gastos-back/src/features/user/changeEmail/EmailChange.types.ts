// // backend/types/email-change.types.ts
// export interface EmailChangeRequest {
//   userId: string;
//   newEmail: string;
//   reason?: string;
//   idempotencyKey?: string;
// }

// export interface EmailChangeResult {
//   processId: string;
//   status: ProcessStatus;
//   message?: string;
//   error?: string;
//   step?: ProcessStep;
// }

// export interface ProcessStatusResponse {
//   processId: string;
//   status: ProcessStatus;
//   step: ProcessStep;
//   userId: string;
//   oldEmail: string;
//   newEmail: string;
//   error?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export type ProcessStatus =
//   | "pending"
//   | "running"
//   | "completed"
//   | "failed"
//   | "compensating"
//   | "compensation_failed";

// export type ProcessStep =
//   | "initialized"
//   | "local_update_started"
//   | "local_update_completed"
//   | "auth_update_started"
//   | "auth_update_completed"
//   | "compensation_started"
//   | "compensation_completed";

// export interface AuthServiceRequest {
//   userId: string;
//   newEmail: string;
//   oldEmail: string;
//   processId: string;
// }

// export interface AuthServiceResponse {
//   success: boolean;
//   message?: string;
//   error?: string;
// }
