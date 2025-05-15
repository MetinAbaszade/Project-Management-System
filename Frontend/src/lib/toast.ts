
import { toast as sonner } from "sonner";

export const toast = {
  success: (msg: string) => sonner.success(msg),
  error: (msg: string) => sonner.error(msg),
  warning: (msg: string) => sonner.warning(msg),
  info: (msg: string) => sonner.message(msg),
  action: (msg: string, label: string, cb: () => void) =>
    sonner(msg, {
      action: {
        label,
        onClick: cb,
      },
    }),
};
