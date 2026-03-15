import { useLogin } from "@/services/hooks/useAuth";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { SignInFormData, SignInViewProps } from "./signin.types";
import { signInSchema } from "./signin.types";

export function useSignInViewModel(): SignInViewProps {
  const navigate = useNavigate();
  const { mutate: login } = useLogin();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignInFormData) => {
    login(data, {
      onSuccess: () => {
        navigate("/");
      },
      onError: (error: Error) => {
        const message =
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : undefined;
        toast.error(
          `Erro: ${message ?? error.message ?? "Falha ao fazer login"}`,
        );
      },
    });
  };

  return {
    form,
    onSubmit,
  };
}
