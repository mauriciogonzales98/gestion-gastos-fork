// // backend/services/EmailChangeService.ts
// import { EntityManager } from '@mikro-orm/core';
// import { User } from '../../../User/user.entity.js';
// import { EmailChangeProcess, ProcessStatus, ProcessStep } from './EmailChangeProcess.js';
// import {
//   EmailChangeRequest,
//   EmailChangeResult,
//   ProcessStatusResponse,
//   AuthServiceRequest,
//   AuthServiceResponse,
// } from './EmailChange.types.js';

// export class EmailChangeService {
//   constructor(private em: EntityManager) {}

//   async initiateEmailChangeProcess(request: EmailChangeRequest): Promise<EmailChangeResult> {
//     // Validate user exists and get current email
//     const user = await this.em.findOne(User, request.userId);
//     if (!user) {
//       throw new Error(`User not found: ${request.userId}`);
//     }

//     // Validate email format
//     if (!this.isValidEmail(request.newEmail)) {
//       throw new Error(`Invalid email format: ${request.newEmail}`);
//     }

//     // Create process entity
//     const process = new EmailChangeProcess(request.userId, user.email, request.newEmail);
//     await this.em.persistAndFlush(process);

//     try {
//       // Execute the process
//       await this.executeProcess(process);

//       return {
//         processId: process.id,
//         status: 'completed',
//         message: 'Email changed successfully',
//         step: process.step,
//       };
//     } catch (error) {
//       // Process failed - return current state
//       return {
//         processId: process.id,
//         status: process.status,
//         error: error instanceof Error ? error.message : 'Unknown error',
//         step: process.step,
//       };
//     }
//   }

//   private async executeProcess(process: EmailChangeProcess): Promise<void> {
//     try {
//       process.markRunning();
//       await this.em.flush();

//       // Step 1: Update local database
//       await this.updateLocalEmail(process);

//       // Step 2: Update auth service
//       await this.updateAuthEmail(process);

//       process.markAuthUpdateCompleted();
//       await this.em.flush();

//     } catch (error) {
//       await this.handleProcessError(process, error as Error);
//       throw error; // Re-throw after handling
//     }
//   }

//   private async updateLocalEmail(process: EmailChangeProcess): Promise<void> {
//     process.markLocalUpdateStarted();
//     await this.em.flush();

//     const user = await this.em.findOne(User, process.userId);
//     if (!user) {
//       throw new Error('User not found during local email update');
//     }

//     // Use the entity method - this should now work
//     user.changeEmail(process.newEmail);
//     await this.em.flush();

//     process.markLocalUpdateCompleted();
//     await this.em.flush();
//   }

//   private async updateAuthEmail(process: EmailChangeProcess): Promise<void> {
//     process.markAuthUpdateStarted();
//     await this.em.flush();

//     const authRequest: AuthServiceRequest = {
//       userId: process.userId,
//       newEmail: process.newEmail,
//       oldEmail: process.oldEmail,
//       processId: process.id,
//     };

//     const response = await this.callAuthService(authRequest);

//     if (!response.success) {
//       throw new Error(`Auth service rejected email change: ${response.error}`);
//     }
//   }

//   private async callAuthService(request: AuthServiceRequest): Promise<AuthServiceResponse> {
//     try {
//       const authResponse = await fetch(`${process.env.AUTH_SERVICE_URL}/email-changes`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${process.env.AUTH_SERVICE_TOKEN}`,
//           'X-Process-Id': request.processId,
//         },
//         body: JSON.stringify(request),
//       });

//       if (!authResponse.ok) {
//         return {
//           success: false,
//           error: `HTTP ${authResponse.status}: ${authResponse.statusText}`,
//         };
//       }

//       return await authResponse.json() as AuthServiceResponse;
//     } catch (error) {
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'Network error',
//       };
//     }
//   }

//   private async handleProcessError(process: EmailChangeProcess, error: Error): Promise<void> {
//     // Only compensate if we successfully updated local email
//     if (process.step === 'local_update_completed') {
//       await this.compensateProcess(process, error);
//     } else {
//       process.markFailed(error);
//       await this.em.flush();
//     }
//   }

//   private async compensateProcess(process: EmailChangeProcess, originalError: Error): Promise<void> {
//     process.markCompensating();
//     await this.em.flush();

//     try {
//       await this.compensateLocalEmail(process);
//       process.markCompensationCompleted();
//       process.markFailed(originalError);
//       await this.em.flush();
//     } catch (compensationError) {
//       process.markCompensationFailed(compensationError as Error);
//       await this.em.flush();
//       await this.alertCompensationFailure(process, compensationError as Error);
//     }
//   }

//   private async compensateLocalEmail(process: EmailChangeProcess): Promise<void> {
//     const user = await this.em.findOne(User, process.userId);
//     if (!user) {
//       throw new Error('User not found during compensation');
//     }

//     // Use the entity method
//     user.changeEmail(process.oldEmail);
//     await this.em.flush();
//   }

//   private async alertCompensationFailure(process: EmailChangeProcess, error: Error): Promise<void> {
//     // Implement your alerting logic here
//     console.error('CRITICAL: Compensation failed', {
//       processId: process.id,
//       userId: process.userId,
//       error: error.message,
//       timestamp: new Date().toISOString(),
//     });

//     // Example: Send to monitoring service
//     // await this.monitoringService.criticalAlert('compensation_failed', {
//     //   processId: process.id,
//     //   userId: process.userId,
//     //   error: error.message,
//     // });
//   }

//   private isValidEmail(email: string): boolean {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   }

//   async getProcessStatus(processId: string): Promise<ProcessStatusResponse> {
//     const process = await this.em.findOne(EmailChangeProcess, processId);
//     if (!process) {
//       throw new Error(`Process not found: ${processId}`);
//     }

//     return {
//       processId: process.id,
//       status: process.status,
//       step: process.step,
//       userId: process.userId,
//       oldEmail: process.oldEmail,
//       newEmail: process.newEmail,
//       error: process.error,
//       createdAt: process.createdAt,
//       updatedAt: process.updatedAt,
//     };
//   }
// }
