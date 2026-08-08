import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import type { ResetPasswordFormState } from "@/lib/auth/actions";

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirme a nova senha" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordViewProps {
  form: UseFormReturn<ResetPasswordFormData>;
  state: ResetPasswordFormState;
  isPending: boolean;
  hasToken: boolean;
  onValidSubmit: (data: ResetPasswordFormData) => void;
}
