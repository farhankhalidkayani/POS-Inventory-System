import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { listPendingOrganizationsQuerySchema } from "@pos/shared";
import { AuthGuard } from "../../shared/security/auth.guard.js";
import { PlatformAdminGuard } from "../../shared/security/platformAdmin.guard.js";
import { SkipOrgApprovalCheck } from "../../shared/security/skipOrgApproval.decorator.js";
import { ListOrganizationsForReviewUseCase } from "./usecases/ListOrganizationsForReview.usecase.js";
import { ReviewOrganizationUseCase } from "./usecases/ReviewOrganization.usecase.js";
import { toPlatformOrganizationResponse } from "./dto/platformOrganization.mapper.js";

@Controller("api/platform/organizations")
@UseGuards(AuthGuard, PlatformAdminGuard)
@SkipOrgApprovalCheck()
export class PlatformAdminController {
  constructor(
    private readonly listOrganizationsForReview: ListOrganizationsForReviewUseCase,
    private readonly reviewOrganization: ReviewOrganizationUseCase
  ) {}

  @Get()
  async list(@Query() query: unknown) {
    const { status } = listPendingOrganizationsQuerySchema.parse(query);
    const results = await this.listOrganizationsForReview.execute(status ?? "PENDING");
    return results.map(({ organization, owner }) => toPlatformOrganizationResponse(organization, owner));
  }

  @Post(":id/approve")
  async approve(@Param("id") id: string) {
    const organization = await this.reviewOrganization.approve(id);
    return toPlatformOrganizationResponse(organization, null);
  }

  @Post(":id/reject")
  async reject(@Param("id") id: string) {
    const organization = await this.reviewOrganization.reject(id);
    return toPlatformOrganizationResponse(organization, null);
  }
}
