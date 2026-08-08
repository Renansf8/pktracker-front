"use client";

import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordAction } from "@/lib/auth/actions";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
  type ForgotPasswordViewProps,
} from "./forgotPassword.types";

const INITIAL_STATE = {
  error: undefined as string | undefined,
  success: false,
};

export function useForgotPasswordViewModel(): ForgotPasswordViewProps {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    INITIAL_STATE,
  );

  const [, startTransition] = useTransition();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onValidSubmit = (data: ForgotPasswordFormData) => {
    const fd = new FormData();
    fd.append("email", data.email);

    startTransition(() => {
      formAction(fd);
    });
  };

  return { form, state, isPending, onValidSubmit };
}
