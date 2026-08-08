import type { Metadata } from "next";
import { ForgotPasswordView } from "./ForgotPassword.view";

export const metadata: Metadata = {
  title: "Esqueci minha senha — PkTracker",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
