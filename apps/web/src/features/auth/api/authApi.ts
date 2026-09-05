import type {
  AuthSessionResponse,
  CurrentUserResponse,
  LoginRequest,
  RegisterOrganizationRequest,
} from "@pos/shared";
import { apiFetch } from "../../../shared/api/httpClient";

export const authApi = {
  register(input: RegisterOrganizationRequest): Promise<AuthSessionResponse> {
    return apiFetch<AuthSessionResponse>("/api/auth/register", { method: "POST", body: input });
  },

  login(input: LoginRequest): Promise<AuthSessionResponse> {
    return apiFetch<AuthSessionResponse>("/api/auth/login", { method: "POST", body: input });
  },

  refresh(): Promise<{ accessToken: string }> {
    return apiFetch<{ accessToken: string }>("/api/auth/refresh", { method: "POST" });
  },

  logout(): Promise<void> {
    return apiFetch<void>("/api/auth/logout", { method: "POST" });
  },

  me(accessToken: string): Promise<CurrentUserResponse> {
    return apiFetch<CurrentUserResponse>("/api/auth/me", { accessToken });
  },
};
