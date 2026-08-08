"use server";

import { redirect } from "next/navigation";
import { setSessionToken, clearSession } from "./session";

export type AuthFormState = {
  error?: string;
};

const API_URL = process.env.API_BASE_URL;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithColdStartRetry(url: string, init: RequestInit, retries = 5, delayMs = 10000): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, init);
    if (res.status !== 429 || attempt === retries) return res;
    await sleep(delayMs);
  }
  // nunca chega aqui, mas satisfaz o TypeScript
  return fetch(url, init);
}

export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Formulário inválido" };
  }

  try {
    const res = await fetchWithColdStartRetry(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (res.status === 429) {
      return { error: "Servidor sobrecarregado. Tente novamente em alguns instantes." };
    }

    if (!res.ok) {
      return { error: "Email ou senha inválidos" };
    }

    const data = (await res.json()) as { accessToken: string };
    if (!data.accessToken) {
      return { error: "Resposta do servidor sem token" };
    }

    await setSessionToken(data.accessToken);
  } catch (err) {
    console.error("[signInAction] unexpected error:", err);
    return { error: "Falha ao conectar com o servidor" };
  }

  redirect("/");
}

export async function signUpAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = formData.get("name");
  const lastName = formData.get("lastName");
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof name !== "string" ||
    typeof lastName !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return { error: "Formulário inválido" };
  }

  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, lastName, email, password }),
      cache: "no-store",
    });

    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      return { error: payload?.message ?? "Não foi possível criar a conta" };
    }

    const data = (await res.json()) as { accessToken?: string };
    if (data.accessToken) {
      await setSessionToken(data.accessToken);
    }
  } catch (err) {
    console.error("[signUpAction] unexpected error:", err);
    return { error: "Falha ao conectar com o servidor" };
  }

  redirect("/");
}

export async function signOutAction(): Promise<void> {
  await clearSession();
  redirect("/signin");
}

export type ForgotPasswordFormState = {
  error?: string;
  success?: boolean;
};

export async function forgotPasswordAction(
  _prevState: ForgotPasswordFormState,
  formData: FormData,
): Promise<ForgotPasswordFormState> {
  const email = formData.get("email");

  if (typeof email !== "string") {
    return { error: "Formulário inválido" };
  }

  try {
    const res = await fetchWithColdStartRetry(
      `${API_URL}/auth/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        cache: "no-store",
      },
    );

    if (res.status === 429) {
      return {
        error: "Servidor sobrecarregado. Tente novamente em alguns instantes.",
      };
    }

    if (!res.ok) {
      return {
        error: "Não foi possível enviar o email de recuperação. Tente novamente.",
      };
    }
  } catch (err) {
    console.error("[forgotPasswordAction] unexpected error:", err);
    return { error: "Falha ao conectar com o servidor" };
  }

  return { success: true };
}

export type ResetPasswordFormState = {
  error?: string;
  success?: boolean;
};

export async function resetPasswordAction(
  _prevState: ResetPasswordFormState,
  formData: FormData,
): Promise<ResetPasswordFormState> {
  const token = formData.get("token");
  const newPassword = formData.get("newPassword");

  if (typeof token !== "string" || !token) {
    return { error: "Link inválido. Solicite uma nova recuperação de senha." };
  }

  if (typeof newPassword !== "string") {
    return { error: "Formulário inválido" };
  }

  try {
    const res = await fetchWithColdStartRetry(
      `${API_URL}/auth/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
        cache: "no-store",
      },
    );

    if (res.status === 429) {
      return {
        error: "Servidor sobrecarregado. Tente novamente em alguns instantes.",
      };
    }

    if (res.status === 400) {
      return {
        error: "Link expirado ou inválido. Solicite uma nova recuperação de senha.",
      };
    }

    if (!res.ok) {
      return { error: "Não foi possível redefinir a senha. Tente novamente." };
    }
  } catch (err) {
    console.error("[resetPasswordAction] unexpected error:", err);
    return { error: "Falha ao conectar com o servidor" };
  }

  return { success: true };
}
