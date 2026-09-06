import { z } from "zod";
import { ROLES } from "../enums/role.js";

export const orgMemberResponseSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.enum(ROLES),
});
export type OrgMemberResponse = z.infer<typeof orgMemberResponseSchema>;
