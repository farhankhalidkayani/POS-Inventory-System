export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierInput {
  organizationId: string;
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
}
