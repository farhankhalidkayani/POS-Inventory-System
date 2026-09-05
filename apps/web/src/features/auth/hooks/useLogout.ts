import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import { useAuthSession } from "../context/AuthSessionContext";

export function useLogout() {
  const { clearSession } = useAuthSession();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearSession();
    },
  });
}
