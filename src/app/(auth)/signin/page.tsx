import type { Metadata } from "next";
import { SignInView } from "./SignIn.view";

export const metadata: Metadata = {
  title: "Entrar — PkTracker",
};

export default function SignInPage() {
  return <SignInView />;
}
