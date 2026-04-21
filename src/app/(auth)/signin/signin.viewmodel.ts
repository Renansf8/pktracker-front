/**
 * src/app/(auth)/signin/signin.viewmodel.ts
 * ---------------------------------------------------------------------------
 * ViewModel da rota /signin.
 *
 * Responsabilidade: orquestrar estado do formulário (react-hook-form) e a
 * Server Action (useActionState), devolvendo para a View um objeto pronto
 * para ser consumido em JSX.
 *
 * ## Antes x Depois
 *
 * ANTES (Vite/SPA):
 *   const { mutate: login } = useLogin();          // axios por baixo
 *   const navigate = useNavigate();
 *   const onSubmit = (data) => login(data, {
 *     onSuccess: () => navigate("/"),
 *     onError: (err) => toast.error(err.message),
 *   });
 *
 * DEPOIS (Next/App Router):
 *   const [state, formAction, isPending] = useActionState(signInAction, { });
 *   // O redirect pra "/" acontece DENTRO da action (no servidor).
 *   // O erro volta como `state.error` e é renderizado pela View.
 *
 * ## Conceitos novos
 *
 * - `useActionState(action, initialState)` (React 19):
 *    - Substitui o antigo `useFormState` do React 18.
 *    - Retorna `[state, formAction, isPending]`.
 *    - `state` é o retorno da última execução da action.
 *    - `formAction` é uma função "fakeada" que o `<form action={...}>` chama
 *      e que o Next serializa + envia pro servidor.
 *    - `isPending` é true enquanto a action está rodando (sem useState extra).
 *
 * - Validação dupla:
 *    - Client: `react-hook-form + zodResolver` → feedback rápido no campo.
 *    - Server: validação equivalente dentro da Server Action (ver actions.ts
 *      de `/lib/auth/actions.ts`). NUNCA confiar só no client.
 *
 * - `onValidSubmit`:
 *    - Precisamos barrar o submit quando o zod client-side falhar. Se
 *      passássemos `formAction` direto no `<form action={...}>`, o browser
 *      enviaria independentemente da validação do RHF.
 *    - Solução: usamos o `form.handleSubmit(onValidSubmit)` no `onSubmit`
 *      do `<form>`. Dentro do onValidSubmit, construímos um FormData
 *      manualmente e chamamos `formAction(fd)`.
 *    - Isso preserva o progressive enhancement parcial (se JS estiver off,
 *      podemos alternar para `<form action={formAction}>` sem o RHF).
 */
"use client";

import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInAction } from "@/lib/auth/actions";
import {
  signInSchema,
  type SignInFormData,
  type SignInViewProps,
} from "./signin.types";

const INITIAL_STATE = { error: undefined as string | undefined };

export function useSignInViewModel(): SignInViewProps {
  // useActionState é o "hook-bridge" entre React e Server Actions.
  // Ele roda no client, mas dispara a action no servidor quando o form
  // é submetido.
  const [state, formAction, isPending] = useActionState(
    signInAction,
    INITIAL_STATE,
  );

  // useTransition é necessário para chamar formAction manualmente (fora de
  // um <form action={...}>). O React 19 exige que actions assíncronas sejam
  // disparadas dentro de uma transition para rastrear isPending corretamente.
  const [, startTransition] = useTransition();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  /**
   * Handler chamado pelo react-hook-form SÓ quando a validação zod passa.
   * Montamos o FormData manualmente porque o RHF não nos dá o FormData
   * bruto — ele nos dá um objeto JS tipado.
   */
  const onValidSubmit = (data: SignInFormData) => {
    const fd = new FormData();
    fd.append("email", data.email);
    fd.append("password", data.password);
    // Dispara a Server Action dentro de uma transition, como o React 19 exige
    // quando a action é chamada manualmente (fora de um <form action={...}>).
    startTransition(() => {
      formAction(fd);
    });
  };

  return {
    form,
    formAction,
    state,
    isPending,
    onValidSubmit,
  };
}
