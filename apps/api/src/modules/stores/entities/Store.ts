export interface Store {
  id: string;
  organizationId: string;
  name: string;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStoreInput {
  organizationId: string;
  name: string;
  address?: string | null;
}
