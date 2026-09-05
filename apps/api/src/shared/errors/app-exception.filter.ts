import { Catch, Logger, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { ZodError } from "zod";
import { AppError } from "./AppError.js";

function hasStatusCode(error: unknown): error is Error & { statusCode: number; code?: string } {
  return (
    error instanceof Error && "statusCode" in error && typeof (error as { statusCode: unknown }).statusCode === "number"
  );
}

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>();

    if (exception instanceof AppError) {
      reply.status(exception.statusCode).send({ error: { code: exception.code, message: exception.message } });
      return;
    }

    if (exception instanceof ZodError) {
      reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          issues: exception.issues,
        },
      });
      return;
    }

    if (hasStatusCode(exception) && exception.statusCode < 500) {
      reply.status(exception.statusCode).send({
        error: { code: exception.code ?? "BAD_REQUEST", message: exception.message },
      });
      return;
    }

    this.logger.error(exception instanceof Error ? exception.stack : exception);
    reply.status(500).send({ error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" } });
  }
}
