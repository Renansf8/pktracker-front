/**
 * src/app/(auth)/signin/signin.types.ts
 * ---------------------------------------------------------------------------
 * Types + schemas zod específicos da rota /signin.
 *
 * Esse arquivo é o mesmo de antes, com dois pontos de atenção:
 *
 *   1. O arquivo NÃO é marcado com "use client" nem "use server" — ele é
 *      "neutro", só exporta types e um schema zod. Isso permite importá-lo
 *      tanto no ViewModel (client) quanto na Server Action (server) sem
 *      forçar o bundle pra um lado só.
 *
 *   2. A prop `state` da View agora vem do `useActionState` (React 19),
 *      e a prop `formAction` é a função que o `<form action={...}>` consome
 *      para disparar a Server Action. Mantemos `form` (react-hook-form) para
 *      continuar fazendo validação CLIENT-SIDE antes de enviar — ótimo UX
 *      (feedback instantâneo) mesmo com action rodando no servidor.
 */
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import type { AuthFormState } from "@/lib/auth/actions";

/**
 * Schema zod da validação client-side. Continua igual à versão SPA.
 *
 * Importante: a mesma validação (ou equivalente) PRECISA rodar também na
 * Server Action — nunca confie só no client. Aqui a regra é simples o
 * suficiente para o backend já cobrir; em formulários mais complexos, vale
 * importar este schema dentro de `actions.ts` e chamar `.safeParse()` lá.
 */
export const signInSchema = z.object({
  email: z.string().email({ message: "Email é obrigatório" }),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
});

export type SignInFormData = z.infer<typeof signInSchema>;

/**
 * Props que a View recebe do ViewModel.
 *
 * - `form`: objeto do react-hook-form (para os `<FormField>` do shadcn).
 * - `formAction`: função que o `<form action={...}>` consome. Foi devolvida
 *    pelo `useActionState` no ViewModel.
 * - `state`: último estado retornado pela Server Action — usamos para
 *    mostrar erros vindos do servidor (ex.: "Email ou senha inválidos").
 * - `isPending`: true enquanto a action está em voo. Útil para desabilitar
 *    o botão ou mostrar spinner.
 * - `onValidSubmit`: handler que o react-hook-form chama APÓS validar o
 *    client-side. Ele chama `formAction(formData)` manualmente, pois nós
 *    queremos barrar o envio quando o zod falhar.
 */
export interface SignInViewProps {
  form: UseFormReturn<SignInFormData>;
  formAction: (formData: FormData) => void;
  state: AuthFormState;
  isPending: boolean;
  onValidSubmit: (data: SignInFormData) => void;
}
