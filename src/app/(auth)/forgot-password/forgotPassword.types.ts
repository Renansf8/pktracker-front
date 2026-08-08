import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import type { ForgotPasswordFormState } from "@/lib/auth/actions";

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordViewProps {
  form: UseFormReturn<ForgotPasswordFormData>;
  state: ForgotPasswordFormState;
  isPending: boolean;
  onValidSubmit: (data: ForgotPasswordFormData) => void;
}
