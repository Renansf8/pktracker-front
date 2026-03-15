import { useRegister } from "@/services/hooks/useAuth";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { SignUpFormData, SignUpViewProps } from "./signup.types";
import { signUpSchema } from "./signup.types";

export function useSignUpViewModel(): SignUpViewProps {
  const navigate = useNavigate();
  const { mutate, isPending } = useRegister();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Conta criada com sucesso");
        navigate("/signin");
      },
      onError: (error: Error) => {
        console.error("Registration failed:", error);
        const message =
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : undefined;
        toast.error(
          `Erro: ${message ?? error.message ?? "Falha ao criar conta"}`,
        );
      },
    });
  };

  return {
    form,
    onSubmit,
    isPending,
  };
}
