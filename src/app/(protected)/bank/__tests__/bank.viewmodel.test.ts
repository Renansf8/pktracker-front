import { renderHook, act } from "@testing-library/react";
import { useBankViewModel } from "../bank.viewmodel";
import { useGetUser } from "@/services/hooks/useGetUser";
import { useBank } from "@/services/hooks/useBank";
import { useDailyBuyInLimit } from "@/utils/useDailyBuyInLimit";

jest.mock("@/services/hooks/useGetUser");
jest.mock("@/services/hooks/useBank");
jest.mock("@/utils/useDailyBuyInLimit");

const mockUseGetUser = useGetUser as jest.MockedFunction<typeof useGetUser>;
const mockUseBank = useBank as jest.MockedFunction<typeof useBank>;
const mockUseDailyBuyInLimit = useDailyBuyInLimit as jest.MockedFunction<typeof useDailyBuyInLimit>;

const mockMutateDeposit = jest.fn();
const mockMutateWithdrawal = jest.fn();
const mockMutateRake = jest.fn();
const mockSetLimitPct = jest.fn();

function makeUser(bankOverrides = {}) {
  return {
    name: "Test",
    email: "test@example.com",
    bank: {
      id: "b1",
      userId: "u1",
      bank: 500,
      totalDeposit: 0,
      totalWithdrawal: 0,
      totalRake: 0,
      profit: 0,
      deposits: [],
      withdrawals: [],
      rakes: [],
      ...bankOverrides,
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();

  mockUseGetUser.mockReturnValue({ data: makeUser() as any, isLoading: false } as any);
  mockUseBank.mockReturnValue({
    createDeposit: { mutate: mockMutateDeposit } as any,
    createWithdrawal: { mutate: mockMutateWithdrawal } as any,
    createRake: { mutate: mockMutateRake } as any,
  });
  mockUseDailyBuyInLimit.mockReturnValue({
    limitPct: 7,
    setLimitPct: mockSetLimitPct,
  });
});

describe("useBankViewModel — estado inicial", () => {
  it("campos de texto iniciam vazios", () => {
    const { result } = renderHook(() => useBankViewModel());

    expect(result.current.amount).toBe("");
    expect(result.current.rakeAmount).toBe("");
    expect(result.current.rakePlatform).toBe("");
    expect(result.current.dailyLimitInput).toBe("");
  });

  it("isLoading reflete useGetUser", () => {
    mockUseGetUser.mockReturnValue({ data: undefined, isLoading: true } as any);

    const { result } = renderHook(() => useBankViewModel());

    expect(result.current.isLoading).toBe(true);
  });

  it("deposits/withdrawals/rakes vêm do user.bank", () => {
    mockUseGetUser.mockReturnValue({
      data: makeUser({
        deposits: [{ id: "d1", date: "2026-05-01", amount: 100 }],
        withdrawals: [{ id: "w1", date: "2026-05-02", amount: 50 }],
        rakes: [{ id: "r1", date: "2026-05-03", amount: 10 }],
      }) as any,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useBankViewModel());

    expect(result.current.deposits).toHaveLength(1);
    expect(result.current.withdrawals).toHaveLength(1);
    expect(result.current.rakes).toHaveLength(1);
  });

  it("retorna arrays vazios quando user.bank não existe", () => {
    mockUseGetUser.mockReturnValue({ data: undefined, isLoading: false } as any);

    const { result } = renderHook(() => useBankViewModel());

    expect(result.current.deposits).toEqual([]);
    expect(result.current.withdrawals).toEqual([]);
    expect(result.current.rakes).toEqual([]);
  });

  it("dailyLimitPct vem de useDailyBuyInLimit", () => {
    mockUseDailyBuyInLimit.mockReturnValue({ limitPct: 5, setLimitPct: mockSetLimitPct });

    const { result } = renderHook(() => useBankViewModel());

    expect(result.current.dailyLimitPct).toBe(5);
  });
});

describe("useBankViewModel — onAmountChange / onRakeAmountChange / onRakePlatformChange", () => {
  it("onAmountChange atualiza amount", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onAmountChange("100"));

    expect(result.current.amount).toBe("100");
  });

  it("onRakeAmountChange atualiza rakeAmount", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onRakeAmountChange("15"));

    expect(result.current.rakeAmount).toBe("15");
  });

  it("onRakePlatformChange atualiza rakePlatform", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onRakePlatformChange("PokerStars"));

    expect(result.current.rakePlatform).toBe("PokerStars");
  });

  it("onDailyLimitInputChange atualiza dailyLimitInput", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onDailyLimitInputChange("10"));

    expect(result.current.dailyLimitInput).toBe("10");
  });
});

describe("useBankViewModel — onDeposit", () => {
  it("chama createDeposit.mutate com o valor correto", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onAmountChange("50"));
    act(() => result.current.onDeposit());

    expect(mockMutateDeposit).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 50 }),
    );
  });

  it("aceita vírgula como separador decimal", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onAmountChange("10,50"));
    act(() => result.current.onDeposit());

    expect(mockMutateDeposit).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 10.5 }),
    );
  });

  it("limpa amount após depósito bem sucedido", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onAmountChange("50"));
    act(() => result.current.onDeposit());

    expect(result.current.amount).toBe("");
  });

  it("não chama mutate quando amount é zero", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onAmountChange("0"));
    act(() => result.current.onDeposit());

    expect(mockMutateDeposit).not.toHaveBeenCalled();
  });

  it("não chama mutate quando amount é negativo", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onAmountChange("-10"));
    act(() => result.current.onDeposit());

    expect(mockMutateDeposit).not.toHaveBeenCalled();
  });

  it("não chama mutate quando amount não é um número", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onAmountChange("abc"));
    act(() => result.current.onDeposit());

    expect(mockMutateDeposit).not.toHaveBeenCalled();
  });
});

describe("useBankViewModel — onWithdrawal", () => {
  it("chama createWithdrawal.mutate com o valor correto", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onAmountChange("75"));
    act(() => result.current.onWithdrawal());

    expect(mockMutateWithdrawal).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 75 }),
    );
  });

  it("limpa amount após saque bem sucedido", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onAmountChange("75"));
    act(() => result.current.onWithdrawal());

    expect(result.current.amount).toBe("");
  });

  it("não chama mutate quando amount é inválido", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onAmountChange("0"));
    act(() => result.current.onWithdrawal());

    expect(mockMutateWithdrawal).not.toHaveBeenCalled();
  });
});

describe("useBankViewModel — onRake", () => {
  it("chama createRake.mutate com o valor correto", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onRakeAmountChange("5"));
    act(() => result.current.onRake());

    expect(mockMutateRake).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 5 }),
    );
  });

  it("inclui platform no payload quando rakePlatform está preenchido", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onRakeAmountChange("5"));
    act(() => result.current.onRakePlatformChange("GGPoker"));
    act(() => result.current.onRake());

    expect(mockMutateRake).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 5, platform: "GGPoker" }),
    );
  });

  it("não inclui platform quando rakePlatform é apenas espaços", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onRakeAmountChange("5"));
    act(() => result.current.onRakePlatformChange("   "));
    act(() => result.current.onRake());

    const call = mockMutateRake.mock.calls[0][0];
    expect(call).not.toHaveProperty("platform");
  });

  it("limpa rakeAmount e rakePlatform após rake bem sucedido", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onRakeAmountChange("5"));
    act(() => result.current.onRakePlatformChange("PokerStars"));
    act(() => result.current.onRake());

    expect(result.current.rakeAmount).toBe("");
    expect(result.current.rakePlatform).toBe("");
  });

  it("não chama mutate quando rakeAmount é inválido", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onRakeAmountChange("0"));
    act(() => result.current.onRake());

    expect(mockMutateRake).not.toHaveBeenCalled();
  });
});

describe("useBankViewModel — onSaveDailyLimit", () => {
  it("chama setLimitPct com o valor correto", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onDailyLimitInputChange("10"));
    act(() => result.current.onSaveDailyLimit());

    expect(mockSetLimitPct).toHaveBeenCalledWith(10);
  });

  it("limpa dailyLimitInput após salvar", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onDailyLimitInputChange("10"));
    act(() => result.current.onSaveDailyLimit());

    expect(result.current.dailyLimitInput).toBe("");
  });

  it("não chama setLimitPct quando valor é zero", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onDailyLimitInputChange("0"));
    act(() => result.current.onSaveDailyLimit());

    expect(mockSetLimitPct).not.toHaveBeenCalled();
  });

  it("não chama setLimitPct quando valor é negativo", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onDailyLimitInputChange("-5"));
    act(() => result.current.onSaveDailyLimit());

    expect(mockSetLimitPct).not.toHaveBeenCalled();
  });

  it("não chama setLimitPct quando valor não é número", () => {
    const { result } = renderHook(() => useBankViewModel());

    act(() => result.current.onDailyLimitInputChange("abc"));
    act(() => result.current.onSaveDailyLimit());

    expect(mockSetLimitPct).not.toHaveBeenCalled();
  });
});
