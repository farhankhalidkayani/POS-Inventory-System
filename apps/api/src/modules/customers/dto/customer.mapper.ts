import type { CustomerResponse } from "@pos/shared";
import type { Customer } from "../entities/Customer.js";

export function toCustomerResponse(customer: Customer): CustomerResponse {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
  };
}
