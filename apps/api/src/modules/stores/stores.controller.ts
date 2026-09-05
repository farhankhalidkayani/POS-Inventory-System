import type { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../../shared/errors/AppError.js";
import { toStoreResponse } from "../auth/dto/auth.mapper.js";
import type { ListStoresForOrganizationUseCase } from "./usecases/ListStoresForOrganization.usecase.js";

export class StoresController {
  constructor(private readonly listStoresForOrganization: ListStoresForOrganizationUseCase) {}

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const context = request.authContext;
    if (!context) {
      throw new UnauthorizedError("Authentication required");
    }

    const stores = await this.listStoresForOrganization.execute(context.organizationId);
    reply.status(200).send(stores.map(toStoreResponse));
  };
}
