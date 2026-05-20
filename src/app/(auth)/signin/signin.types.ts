import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import type { AuthFormState } from "@/lib/auth/actions";

export const signInSchema = z.object({
  email: z.string().email({ message: "Email é obrigatório" }),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export interface SignInViewProps {
  form: UseFormReturn<SignInFormData>;
  formAction: (formData: FormData) => void;
  state: AuthFormState;
  isPending: boolean;
  onValidSubmit: (data: SignInFormData) => void;
}
