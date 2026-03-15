import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email({ message: "Email é obrigatório" }),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export interface SignInViewProps {
  form: UseFormReturn<SignInFormData>;
  onSubmit: (data: SignInFormData) => void;
}
