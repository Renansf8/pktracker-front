import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BankView } from "../Bank.view";
import { useBankViewModel } from "../bank.viewmodel";
import type { BankViewProps } from "../bank.types";

jest.mock("../bank.viewmodel");
const mockViewModel = useBankViewModel as jest.MockedFunction<typeof useBankViewModel>;

function baseProps(overrides: Partial<BankViewProps> = {}): BankViewProps {
  return {
    isLoading: false,
    amount: "",
    rakeAmount: "",
    rakePlatform: "",
    deposits: [],
    withdrawals: [],
    rakes: [],
    dailyLimitPct: 7,
    dailyLimitInput: "",
    onAmountChange: jest.fn(),
    onRakeAmountChange: jest.fn(),
    onRakePlatformChange: jest.fn(),
    onDeposit: jest.fn(),
    onWithdrawal: jest.fn(),
    onRake: jest.fn(),
    onDailyLimitInputChange: jest.fn(),
    onSaveDailyLimit: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mockViewModel.mockReturnValue(baseProps());
});

describe("BankView — loading", () => {
  it("exibe loading quando isLoading é true", () => {
    mockViewModel.mockReturnValue(baseProps({ isLoading: true }));

    render(<BankView />);

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it("não exibe loading quando dados disponíveis", () => {
    render(<BankView />);

    expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
  });
});

describe("BankView — seções principais", () => {
  it("exibe as 3 seções de cabeçalho", () => {
    render(<BankView />);

    expect(screen.getByText(/configurações/i)).toBeInTheDocument();
    expect(screen.getByText(/^ações$/i)).toBeInTheDocument();
    expect(screen.getByText(/^depósitos$/i)).toBeInTheDocument();
    expect(screen.getByText(/^saques$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^rake$/i).length).toBeGreaterThanOrEqual(1);
  });

  it("exibe o limite diário configurado", () => {
    mockViewModel.mockReturnValue(baseProps({ dailyLimitPct: 5 }));

    render(<BankView />);

    expect(screen.getByText(/5%\s*da banca/i)).toBeInTheDocument();
  });
});

describe("BankView — estados vazios das tabelas", () => {
  it("exibe mensagem quando não há depósitos", () => {
    render(<BankView />);

    expect(screen.getByText(/nenhum depósito registrado/i)).toBeInTheDocument();
  });

  it("exibe mensagem quando não há saques", () => {
    render(<BankView />);

    expect(screen.getByText(/nenhum saque registrado/i)).toBeInTheDocument();
  });

  it("exibe mensagem quando não há rake", () => {
    render(<BankView />);

    expect(screen.getByText(/nenhum rake registrado/i)).toBeInTheDocument();
  });
});

describe("BankView — tabelas com dados", () => {
  it("exibe linhas na tabela de depósitos", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        deposits: [
          { id: "d1", date: "2026-05-01T00:00:00.000Z", amount: 100 },
          { id: "d2", date: "2026-05-10T00:00:00.000Z", amount: 200 },
        ],
      }),
    );

    render(<BankView />);

    expect(screen.getByText("$ 100.00")).toBeInTheDocument();
    expect(screen.getByText("$ 200.00")).toBeInTheDocument();
  });

  it("exibe o total de depósitos", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        deposits: [
          { id: "d1", date: "2026-05-01T00:00:00.000Z", amount: 100 },
          { id: "d2", date: "2026-05-10T00:00:00.000Z", amount: 200 },
        ],
      }),
    );

    render(<BankView />);

    expect(screen.getByText("$ 300.00")).toBeInTheDocument();
  });

  it("exibe linhas na tabela de saques", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        withdrawals: [{ id: "w1", date: "2026-05-05T00:00:00.000Z", amount: 50 }],
      }),
    );

    render(<BankView />);

    expect(screen.getAllByText("$ 50.00").length).toBeGreaterThanOrEqual(1);
  });

  it("exibe linhas na tabela de rake com plataforma", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        rakes: [{ id: "r1", date: "2026-05-03T00:00:00.000Z", amount: 15, platform: "GGPoker" }],
      }),
    );

    render(<BankView />);

    expect(screen.getByText("GGPoker")).toBeInTheDocument();
    expect(screen.getAllByText("$ 15.00").length).toBeGreaterThanOrEqual(1);
  });

  it("exibe '—' quando rake não tem plataforma", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        rakes: [{ id: "r1", date: "2026-05-03T00:00:00.000Z", amount: 5 }],
      }),
    );

    render(<BankView />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("BankView — estados dos botões", () => {
  it("botão Depósito desabilitado quando amount está vazio", () => {
    render(<BankView />);

    expect(screen.getByRole("button", { name: /depósito/i })).toBeDisabled();
  });

  it("botão Saque desabilitado quando amount está vazio", () => {
    render(<BankView />);

    expect(screen.getByRole("button", { name: /saque/i })).toBeDisabled();
  });

  it("botão Rake desabilitado quando rakeAmount está vazio", () => {
    render(<BankView />);

    expect(screen.getByRole("button", { name: /^rake$/i })).toBeDisabled();
  });

  it("botão Salvar desabilitado quando dailyLimitInput está vazio", () => {
    render(<BankView />);

    expect(screen.getByRole("button", { name: /salvar/i })).toBeDisabled();
  });

  it("botão Depósito habilitado quando amount está preenchido", () => {
    mockViewModel.mockReturnValue(baseProps({ amount: "50" }));

    render(<BankView />);

    expect(screen.getByRole("button", { name: /depósito/i })).not.toBeDisabled();
  });

  it("botão Saque habilitado quando amount está preenchido", () => {
    mockViewModel.mockReturnValue(baseProps({ amount: "50" }));

    render(<BankView />);

    expect(screen.getByRole("button", { name: /saque/i })).not.toBeDisabled();
  });
});

describe("BankView — interações", () => {
  it("chama onDeposit ao clicar em Depósito", async () => {
    const onDeposit = jest.fn();
    mockViewModel.mockReturnValue(baseProps({ amount: "100", onDeposit }));

    render(<BankView />);
    await userEvent.click(screen.getByRole("button", { name: /depósito/i }));

    expect(onDeposit).toHaveBeenCalledTimes(1);
  });

  it("chama onWithdrawal ao clicar em Saque", async () => {
    const onWithdrawal = jest.fn();
    mockViewModel.mockReturnValue(baseProps({ amount: "100", onWithdrawal }));

    render(<BankView />);
    await userEvent.click(screen.getByRole("button", { name: /saque/i }));

    expect(onWithdrawal).toHaveBeenCalledTimes(1);
  });

  it("chama onSaveDailyLimit ao pressionar Enter no input de limite", async () => {
    const onSaveDailyLimit = jest.fn();
    mockViewModel.mockReturnValue(baseProps({ dailyLimitInput: "10", onSaveDailyLimit }));

    render(<BankView />);
    await userEvent.type(screen.getByPlaceholderText("7"), "{Enter}");

    expect(onSaveDailyLimit).toHaveBeenCalledTimes(1);
  });
});
