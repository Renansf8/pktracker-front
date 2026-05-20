import { renderHook, act } from "@testing-library/react";
import { useSignInViewModel } from "../signin.viewmodel";

jest.mock("@/lib/auth/actions", () => ({
  signInAction: jest.fn(),
}));

describe("useSignInViewModel", () => {
  it("initializa com estado padrão", () => {
    const { result } = renderHook(() => useSignInViewModel());

    expect(result.current.isPending).toBe(false);
    expect(result.current.state.error).toBeUndefined();
    expect(result.current.form).toBeDefined();
  });

  it("form começa com campos vazios", () => {
    const { result } = renderHook(() => useSignInViewModel());

    expect(result.current.form.getValues()).toEqual({
      email: "",
      password: "",
    });
  });

  it("valida email inválido", async () => {
    const { result } = renderHook(() => useSignInViewModel());

    let isValid = true;
    await act(async () => {
      isValid = await result.current.form.trigger("email");
    });

    // campo vazio não passa validação de email
    expect(isValid).toBe(false);
  });

  it("valida senha curta demais", async () => {
    const { result } = renderHook(() => useSignInViewModel());

    act(() => {
      result.current.form.setValue("password", "123");
    });

    let isValid = true;
    await act(async () => {
      isValid = await result.current.form.trigger("password");
    });

    expect(isValid).toBe(false);
  });

  it("não tem erros com dados válidos", async () => {
    const { result } = renderHook(() => useSignInViewModel());

    act(() => {
      result.current.form.setValue("email", "user@example.com");
      result.current.form.setValue("password", "senha123");
    });

    await act(async () => {
      await result.current.form.trigger();
    });

    expect(result.current.form.formState.errors).toEqual({});
  });
});
