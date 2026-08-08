import type { Metadata } from "next";
import { ResetPasswordView } from "./ResetPassword.view";

export const metadata: Metadata = {
  title: "Redefinir senha — PkTracker",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return <ResetPasswordView token={token} />;
}
