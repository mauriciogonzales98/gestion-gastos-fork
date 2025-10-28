// backend/Registration/registrationProcess.controller.ts
import { Request, Response, NextFunction } from "express";
import { RegistrationService } from "../Services/registrationProcess.service.js";
import { orm } from "../shared/db/orm.js";
const em = orm.em;

function SanitizeRegistrationInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    surname: req.body.surname,
  };

  // Remove undefined values
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function register(req: Request, res: Response) {
  try {
    const { email, password, name, surname } = req.body.sanitizedInput;

    // Create registration service instance
    const registrationService = new RegistrationService(em);

    // Prepare registration request
    const registrationRequest = {
      email,
      password,
      name,
      surname,
    };

    // Execute registration process
    const result = await registrationService.registerUser(registrationRequest);

    // Handle different registration outcomes
    if (result.status === "completed") {
      res.status(201).json({
        message: "Usuario creado exitosamente",
        data: {
          userId: result.userId,
          processId: result.processId,
        },
      });
    } else if (
      result.status === "failed" ||
      result.status === "compensation_failed"
    ) {
      res.status(422).json({
        message: "Error en el registro",
        error: result.error,
        processId: result.processId,
        step: result.step,
      });
    } else {
      res.status(202).json({
        message: "Registro en proceso",
        processId: result.processId,
        status: result.status,
      });
    }
  } catch (error: any) {
    // Handle specific error types
    if (error.message.includes("already exists")) {
      res.status(409).json({ message: error.message });
    } else if (
      error.message.includes("Invalid") ||
      error.message.includes("Password")
    ) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}

async function getRegistrationStatus(req: Request, res: Response) {
  try {
    const processId = req.params.processId;

    const registrationService = new RegistrationService(em);
    const process = await registrationService.getRegistrationStatus(processId);

    res.status(200).json({
      message: "found registration process",
      data: {
        processId: process.id,
        status: process.status,
        step: process.step,
        email: process.email,
        authCreated: process.authCreated,
        userId: process.userId,
        error: process.error,
        createdAt: process.createdAt,
        updatedAt: process.updatedAt,
      },
    });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}

async function findAllRegistrations(req: Request, res: Response) {
  try {
    const registrationService = new RegistrationService(em);
    // This would need to be implemented in your service
    // const processes = await registrationService.findAll();
    // res.status(200).json({ message: "found all registration processes", data: processes });

    res
      .status(501)
      .json({ message: "findAll not implemented for registration processes" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export {
  SanitizeRegistrationInput,
  register,
  getRegistrationStatus,
  findAllRegistrations,
};
