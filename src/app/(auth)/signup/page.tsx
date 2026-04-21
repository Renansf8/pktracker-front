import type { Metadata } from "next";
import { SignUpView } from "./SignUp.view";

export const metadata: Metadata = {
  title: "Criar conta — PkTracker",
};

export default function SignUpPage() {
  return <SignUpView />;
}
