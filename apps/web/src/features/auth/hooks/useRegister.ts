import { useMutation } from "@tanstack/react-query";
import type { RegisterOrganizationRequest } from "@pos/shared";
import { authApi } from "../api/authApi";
import { useAuthSession } from "../context/AuthSessionContext";

export function useRegister() {
  const { setSession } = useAuthSession();

  return useMutation({
    mutationFn: (input: RegisterOrganizationRequest) => authApi.register(input),
    onSuccess: (result) => {
      setSession(result);
    },
  });
}
