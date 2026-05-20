import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpView } from "../SignUp.view";
import { useSignUpViewModel } from "../signup.viewmodel";
import {
  signUpSchema,
  type SignUpFormData,
  type SignUpViewProps,
} from "../signup.types";

jest.mock("../signup.viewmodel");
const mockViewModel = useSignUpViewModel as jest.MockedFunction<
  typeof useSignUpViewModel
>;

function WrappedView(
  overrides: Partial<Pick<SignUpViewProps, "isPending" | "state">> = {},
) {
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", lastName: "", email: "", password: "" },
  });

  mockViewModel.mockReturnValue({
    form,
    formAction: jest.fn(),
    state: { error: undefined },
    isPending: false,
    onValidSubmit: jest.fn(),
    ...overrides,
  });

  return <SignUpView />;
}

describe("SignUpView", () => {
  it("renderiza sem quebrar", () => {
    render(<WrappedView />);
    expect(screen.getByRole("button", { name: /criar/i })).toBeInTheDocument();
  });

  it("exibe os 4 campos do formulário com labels corretos", () => {
    render(<WrappedView />);

    expect(screen.getByLabelText(/^nome$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sobrenome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it("exibe link para a página de login", () => {
    render(<WrappedView />);

    const link = screen.getByRole("link", { name: /faça login/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/signin");
  });

  it("exibe mensagem de erro do servidor quando state.error está definido", () => {
    render(<WrappedView state={{ error: "Email já cadastrado" }} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Email já cadastrado");
  });

  it("botão fica desabilitado e exibe 'Criando...' quando isPending", () => {
    render(<WrappedView isPending={true} />);

    const button = screen.getByRole("button", { name: /criando/i });
    expect(button).toBeDisabled();
  });

  it("botão exibe 'Criar' e está habilitado quando não está pendente", () => {
    render(<WrappedView isPending={false} />);

    const button = screen.getByRole("button", { name: /^criar$/i });
    expect(button).not.toBeDisabled();
  });

  it("exibe erros de validação ao submeter com campos vazios", async () => {
    const user = userEvent.setup();
    render(<WrappedView />);

    await user.click(screen.getByRole("button", { name: /^criar$/i }));

    expect(await screen.findByText("Nome é obrigatório")).toBeInTheDocument();
    expect(
      await screen.findByText("Sobrenome é obrigatório"),
    ).toBeInTheDocument();
  });
});
