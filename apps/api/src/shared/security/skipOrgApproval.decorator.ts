import { SetMetadata } from "@nestjs/common";

export const SKIP_ORG_APPROVAL_KEY = "skipOrgApproval";
export const SkipOrgApprovalCheck = () => SetMetadata(SKIP_ORG_APPROVAL_KEY, true);
