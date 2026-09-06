import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { REPORTS_REPOSITORY, STORES_REPOSITORY } from "../../../shared/di/tokens.js";
import type { StoresRepository } from "../../stores/repositories/stores.repository.js";
import type { ReportsRepository, SalesSummary } from "../repositories/reports.repository.js";

@Injectable()
export class GetSalesSummaryUseCase {
  constructor(
    @Inject(REPORTS_REPOSITORY) private readonly reportsRepository: ReportsRepository,
    @Inject(STORES_REPOSITORY) private readonly storesRepository: StoresRepository
  ) {}

  async execute(organizationId: string, storeId: string, days: number): Promise<SalesSummary> {
    const store = await this.storesRepository.findById(organizationId, storeId);
    if (!store) {
      throw new NotFoundError("Store not found");
    }

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    return this.reportsRepository.getSalesSummary(organizationId, storeId, since);
  }
}
