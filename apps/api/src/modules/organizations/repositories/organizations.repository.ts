import type { CreateOrganizationInput, Organization } from "../entities/Organization.js";

export interface OrganizationsRepository {
  create(input: CreateOrganizationInput): Promise<Organization>;
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
}
