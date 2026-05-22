"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpAction } from "@/lib/auth/actions";
import {
  signUpSchema,
  type SignUpFormData,
  type SignUpViewProps,
} from "./signup.types";

const INITIAL_STATE = { error: undefined as string | undefined };

export function useSignUpViewModel(): SignUpViewProps {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    INITIAL_STATE,
  );

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onValidSubmit = (data: SignUpFormData) => {
    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("lastName", data.lastName);
    fd.append("email", data.email);
    fd.append("password", data.password);
    formAction(fd);
  };

  return {
    form,
    formAction,
    state,
    isPending,
    onValidSubmit,
  };
}
