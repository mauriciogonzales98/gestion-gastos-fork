// backend/types/registration.types.ts
export interface RegistrationRequest {
  email: string;
  password: string;
  name: string;
  surname: string;
}

export interface RegistrationResult {
  processId: string;
  status: ProcessStatus;
  userId?: string;
  authCreated?: boolean;
  message?: string;
  error?: string;
  step?: ProcessStep;
}

export interface AuthUserRecord {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
}

export type ProcessStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "compensating"
  | "compensation_failed";

export type ProcessStep =
  | "initialized"
  | "auth_creation_started"
  | "auth_creation_completed"
  | "user_creation_started"
  | "user_creation_completed"
  | "compensation_started"
  | "compensation_completed";
