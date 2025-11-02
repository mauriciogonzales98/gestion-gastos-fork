// backend/services/registration.service.ts
import { EntityManager } from "@mikro-orm/core";
import { User } from "../User/user.entity.js";
import { getAuth } from "firebase-admin/auth";
import { RegistrationProcess } from "../Registration/registrationProcess.entity.js";

import {
  RegistrationRequest,
  RegistrationResult,
  AuthUserRecord,
} from "../Registration/registrationProcess.types";

export class RegistrationService {
  constructor(private em: EntityManager) {}

  async registerUser(
    request: RegistrationRequest
  ): Promise<RegistrationResult> {
    // Validate request
    if (!this.isValidEmail(request.email)) {
      throw new Error(`Invalid email format: ${request.email}`);
    }

    if (!this.isValidPassword(request.password)) {
      throw new Error(
        "Password must be at least 8 characters with letters and numbers"
      );
    }

    // Check if user already exists
    const existingUser = await this.em.findOne(User, { email: request.email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create registration process
    const process = new RegistrationProcess(
      request.email,
      request.name,
      request.surname
    );
    await this.em.persistAndFlush(process);

    try {
      // Execute the registration process
      await this.executeRegistrationProcess(process, request);

      return {
        processId: process.id,
        status: "completed",
        userId: process.userId,
        authCreated: process.authCreated,
        message: "User registered successfully",
        step: process.step,
      };
    } catch (error) {
      // Process failed - return current state
      return {
        processId: process.id,
        status: process.status,
        error: error instanceof Error ? error.message : "Unknown error",
        step: process.step,
      };
    }
  }

  private async executeRegistrationProcess(
    process: RegistrationProcess,
    request: RegistrationRequest
  ): Promise<void> {
    try {
      process.markRunning();
      await this.em.flush();
      console.log("Process marked as running");

      // STEP 1: Create user in Firebase Auth (generates UID)
      const authUser = await this.createAuthUser(process, request);
      console.log("Firebase auth user created: ", authUser.uid);

      // STEP 2: Create user in local database using Firebase UID
      console.log(" Step 2: Creating local database user...");
      await this.createLocalUser(process, request, authUser.uid);

      process.markUserCreationCompleted(authUser.uid);
      console.log(" Registration process completed successfully");
      await this.em.flush();
    } catch (error) {
      console.error(" Registration process failed:", error);
      await this.handleRegistrationError(process, error as Error);
      throw error;
    }
  }

  private async createAuthUser(
    process: RegistrationProcess,
    request: RegistrationRequest
  ): Promise<AuthUserRecord> {
    process.markAuthCreationStarted();
    await this.em.flush();

      const authUser = await this.callFirebaseAuth(request);

      process.markAuthCreationCompleted(authUser.uid);
      await this.em.flush();
      console.log("Auth Creation marked completed");
      return authUser;
  }

  private async createLocalUser(process: RegistrationProcess, request: RegistrationRequest, firebaseUid: string): Promise<void> {

    process.markUserCreationStarted();
    await this.em.flush();

      // Llama a un método estático en User.entity
      const user = User.createFromFirebase(
        firebaseUid,
        request.email,
        request.name,
        request.surname
      );

      // Pushea el usuario a la base de datos
      await this.em.persistAndFlush(user);
      console.log("User entity created");

      process.userId = user.id;
      await this.em.flush();

      console.log("Process updated with user ID:", user.id);
    
  }

  private async handleRegistrationError(
    process: RegistrationProcess,
    error: Error
  ): Promise<void> {
    console.log("🔄 Handling registration error...");
    console.log("   Current process step:", process.step);
    console.log("   Auth UID:", process.userId);
    // Solo compensa si se ha creado el usuario en FB
    // pero falló la creación del usuario en BE
    if (process.step === "auth_creation_completed" && process.authCreated) {
      console.log(" Starting compensation: deleting Firebase user...");
      await this.compensateRegistration(process, error);
    } else {
      console.log(" No compensation needed - auth user was not created");
      process.markFailed(error);
      await this.em.flush();
    }
  }

  private async compensateRegistration(
    process: RegistrationProcess,
    originalError: Error
  ): Promise<void> {
    process.markCompensating();
    await this.em.flush();
    console.log(" Compensation started for process:", process.id);

    try {
      console.log(" Deleting Firebase user:", process.userId);
      // Delete the Firebase auth user that was created
      await this.deleteAuthUser(process.userId!);
      // Marca la compensación como completada, y a la creación del usuario en BE como fallida.
      process.markCompensationCompleted();
      process.markFailed(originalError);
      await this.em.flush();
      console.log("Compensation completed successfully");
    } catch (compensationError) {
      console.error("Compensation failed:", compensationError);
      // Marca la compensación como fallida y envía una alerta
      process.markCompensationFailed(compensationError as Error);
      await this.em.flush();
      await this.alertCompensationFailure(process, compensationError as Error);
    }
  }

  private async callFirebaseAuth(
    request: RegistrationRequest
  ): Promise<AuthUserRecord> {
    try {
      const auth = getAuth();

      const userRecord = await auth.createUser({
        email: request.email,
        password: request.password,
        displayName: `${request.name} ${request.surname}`.trim(),
        emailVerified: false,
      });

      // Send email verification
      //await auth.generateEmailVerificationLink(request.email);
      console.log("Email verification goes here.");

      return {
        uid: userRecord.uid,
        email: userRecord.email!,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
      };
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === "auth/email-already-exists") {
        throw new Error(
          "User with this email already exists in authentication system"
        );
      }
      if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address");
      }
      if (error.code === "auth/weak-password") {
        throw new Error("Password is too weak");
      }
      throw new Error(`Authentication service error: ${error.message}`);
    }
  }

  private async deleteAuthUser(userId: string): Promise<void> {
    try {
      const auth = getAuth();
      await auth.deleteUser(userId);
    } catch (error) {
      throw new Error(
        `Failed to delete auth user during compensation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async alertCompensationFailure(
    process: RegistrationProcess,
    error: Error
  ): Promise<void> {
    console.error("CRITICAL: Registration compensation failed", {
      processId: process.id,
      email: process.email,
      authCreated: process.authCreated,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }

  async getRegistrationStatus(processId: string): Promise<RegistrationProcess> {
    const process = await this.em.findOne(RegistrationProcess, processId);
    if (!process) {
      throw new Error(`Registration process not found: ${processId}`);
    }
    return process;
  }
}
