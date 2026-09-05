import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCategoryRequest } from "@pos/shared";
import { useAuthSession } from "../../auth";
import { catalogApi } from "../api/catalogApi";
import { CATEGORIES_QUERY_KEY } from "./useCategories";

export function useCreateCategory() {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryRequest) => catalogApi.createCategory(session!.accessToken, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}
