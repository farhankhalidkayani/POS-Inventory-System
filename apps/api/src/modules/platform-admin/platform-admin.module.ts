import { Module } from "@nestjs/common";
import { OrganizationsModule } from "../organizations/organizations.module.js";
import { UsersModule } from "../users/users.module.js";
import { ListOrganizationsForReviewUseCase } from "./usecases/ListOrganizationsForReview.usecase.js";
import { ReviewOrganizationUseCase } from "./usecases/ReviewOrganization.usecase.js";
import { PlatformAdminController } from "./platform-admin.controller.js";

@Module({
  imports: [OrganizationsModule, UsersModule],
  controllers: [PlatformAdminController],
  providers: [ListOrganizationsForReviewUseCase, ReviewOrganizationUseCase],
})
export class PlatformAdminModule {}
