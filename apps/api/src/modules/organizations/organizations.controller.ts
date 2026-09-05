import type { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../../shared/errors/AppError.js";
import { toOrganizationResponse } from "../auth/dto/auth.mapper.js";
import type { GetCurrentOrganizationUseCase } from "./usecases/GetCurrentOrganization.usecase.js";

export class OrganizationsController {
  constructor(private readonly getCurrentOrganization: GetCurrentOrganizationUseCase) {}

  me = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const context = request.authContext;
    if (!context) {
      throw new UnauthorizedError("Authentication required");
    }

    const organization = await this.getCurrentOrganization.execute(context.organizationId);
    reply.status(200).send(toOrganizationResponse(organization));
  };
}
