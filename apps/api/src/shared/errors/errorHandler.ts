import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "./AppError.js";

export function errorHandler(
  error: FastifyError | AppError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({ error: { code: error.code, message: error.message } });
    return;
  }

  if (error instanceof ZodError) {
    reply.status(400).send({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        issues: error.issues,
      },
    });
    return;
  }

  if ("statusCode" in error && typeof error.statusCode === "number" && error.statusCode < 500) {
    reply.status(error.statusCode).send({
      error: { code: error.code ?? "BAD_REQUEST", message: error.message },
    });
    return;
  }

  request.log.error(error);
  reply.status(500).send({ error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" } });
}
