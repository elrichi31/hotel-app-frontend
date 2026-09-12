import { toast as sonnerToast } from "sonner";

/**
 * Reemplazo de la API estática `message` de antd. Mismo nombre de métodos
 * para que la migración de los ~23 archivos que la usan sea un cambio de
 * import mecánico (`message.success(...)` -> `toast.success(...)`).
 */
export const toast = {
  success: (content: string) => sonnerToast.success(content),
  error: (content: string) => sonnerToast.error(content),
  warning: (content: string) => sonnerToast.warning(content),
  info: (content: string) => sonnerToast.info(content),
};
