import { renderHook, act } from "@testing-library/react";
import { useSignUpViewModel } from "../signup.viewmodel";

jest.mock("@/lib/auth/actions", () => ({
  signUpAction: jest.fn(),
}));

describe("useSignUpViewModel", () => {
  it("initializa com estado padrão", () => {
    const { result } = renderHook(() => useSignUpViewModel());

    expect(result.current.isPending).toBe(false);
    expect(result.current.state.error).toBeUndefined();
    expect(result.current.form).toBeDefined();
    expect(result.current.onValidSubmit).toBeInstanceOf(Function);
  });

  it("form começa com todos os campos vazios", () => {
    const { result } = renderHook(() => useSignUpViewModel());

    expect(result.current.form.getValues()).toEqual({
      name: "",
      lastName: "",
      email: "",
      password: "",
    });
  });

  it("valida nome obrigatório", async () => {
    const { result } = renderHook(() => useSignUpViewModel());

    let isValid = true;
    await act(async () => {
      isValid = await result.current.form.trigger("name");
    });

    expect(isValid).toBe(false);
  });

  it("valida sobrenome obrigatório", async () => {
    const { result } = renderHook(() => useSignUpViewModel());

    let isValid = true;
    await act(async () => {
      isValid = await result.current.form.trigger("lastName");
    });

    expect(isValid).toBe(false);
  });

  it("valida email inválido", async () => {
    const { result } = renderHook(() => useSignUpViewModel());

    let isValid = true;
    await act(async () => {
      isValid = await result.current.form.trigger("email");
    });

    expect(isValid).toBe(false);
  });

  it("valida senha curta demais", async () => {
    const { result } = renderHook(() => useSignUpViewModel());

    act(() => {
      result.current.form.setValue("password", "123");
    });

    let isValid = true;
    await act(async () => {
      isValid = await result.current.form.trigger("password");
    });

    expect(isValid).toBe(false);
  });

  it("passa validação com dados válidos em todos os campos", async () => {
    const { result } = renderHook(() => useSignUpViewModel());

    act(() => {
      result.current.form.setValue("name", "João");
      result.current.form.setValue("lastName", "Silva");
      result.current.form.setValue("email", "joao@example.com");
      result.current.form.setValue("password", "senha123");
    });

    let isValid = false;
    await act(async () => {
      isValid = await result.current.form.trigger();
    });

    expect(isValid).toBe(true);
  });
});
