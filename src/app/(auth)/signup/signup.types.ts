/**
 * src/app/(auth)/signup/signup.types.ts
 * ---------------------------------------------------------------------------
 * Types da rota /signup. Mesmo padrão do signin — `form`, `formAction`,
 * `state`, `isPending`.
 */
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import type { AuthFormState } from "@/lib/auth/actions";

export const signUpSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  lastName: z.string().min(1, { message: "Sobrenome é obrigatório" }),
  email: z.string().email({ message: "Email é obrigatório" }),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export interface SignUpViewProps {
  form: UseFormReturn<SignUpFormData>;
  formAction: (formData: FormData) => void;
  state: AuthFormState;
  isPending: boolean;
  onValidSubmit: (data: SignUpFormData) => void;
}
