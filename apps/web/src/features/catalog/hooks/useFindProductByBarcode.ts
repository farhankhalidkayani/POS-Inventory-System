import { useMutation } from "@tanstack/react-query";
import { useAuthSession } from "../../auth";
import { catalogApi } from "../api/catalogApi";

export function useFindProductByBarcode() {
  const { session } = useAuthSession();

  return useMutation({
    mutationFn: (barcode: string) => catalogApi.findProductByBarcode(session!.accessToken, barcode),
  });
}
