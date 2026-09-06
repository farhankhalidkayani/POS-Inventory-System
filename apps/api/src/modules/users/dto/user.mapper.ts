import type { OrgMemberResponse } from "@pos/shared";
import type { User } from "../entities/User.js";

export function toOrgMemberResponse(user: User): OrgMemberResponse {
  return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role };
}
