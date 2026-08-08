"use client";

import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordAction } from "@/lib/auth/actions";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
  type ResetPasswordViewProps,
} from "./resetPassword.types";

const INITIAL_STATE = {
  error: undefined as string | undefined,
  success: false,
};

export function useResetPasswordViewModel(
  token: string | undefined,
): ResetPasswordViewProps {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    INITIAL_STATE,
  );

  const [, startTransition] = useTransition();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onValidSubmit = (data: ResetPasswordFormData) => {
    if (!token) return;

    const fd = new FormData();
    fd.append("token", token);
    fd.append("newPassword", data.newPassword);

    startTransition(() => {
      formAction(fd);
    });
  };

  return { form, state, isPending, hasToken: Boolean(token), onValidSubmit };
}
