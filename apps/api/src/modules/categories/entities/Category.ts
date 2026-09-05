export interface Category {
  id: string;
  organizationId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  organizationId: string;
  name: string;
}
