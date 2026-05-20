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
  const [state, formAction, isPending] = useActionState(
    signInAction,
    INITIAL_STATE,
  );

  const [, startTransition] = useTransition();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onValidSubmit = (data: SignInFormData) => {
    const fd = new FormData();
    fd.append("email", data.email);
    fd.append("password", data.password);

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
