import { useMutation } from "@tanstack/react-query";
import type { LoginRequest } from "@pos/shared";
import { authApi } from "../api/authApi";
import { useAuthSession } from "../context/AuthSessionContext";

export function useLogin() {
  const { setSession } = useAuthSession();

  return useMutation({
    mutationFn: (input: LoginRequest) => authApi.login(input),
    onSuccess: (result) => {
      setSession(result);
    },
  });
}
