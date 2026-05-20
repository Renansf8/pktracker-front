import { renderHook } from "@testing-library/react";
import { useProfileViewModel } from "../profile.viewmodel";
import { useGetUser } from "@/services/hooks/useGetUser";

jest.mock("@/services/hooks/useGetUser");
const mockUseGetUser = useGetUser as jest.MockedFunction<typeof useGetUser>;

function makeUser(overrides: Partial<{
  name: string;
  email: string;
  bank: number;
  totalDeposit: number;
  totalWithdrawal: number;
  profit: number;
  totalRake: number;
}> = {}) {
  return {
    name: "João",
    email: "joao@example.com",
    bank: {
      id: "b1",
      userId: "u1",
      bank: overrides.bank ?? 500,
      totalDeposit: overrides.totalDeposit ?? 600,
      totalWithdrawal: overrides.totalWithdrawal ?? 100,
      totalRake: overrides.totalRake ?? 10,
      profit: overrides.profit ?? 50,
      deposits: [],
      withdrawals: [],
      rakes: [],
    },
    ...("name" in overrides ? { name: overrides.name! } : {}),
    ...("email" in overrides ? { email: overrides.email! } : {}),
  };
}

beforeEach(() => {
  mockUseGetUser.mockReturnValue({ data: makeUser() as any, isLoading: false } as any);
});

describe("useProfileViewModel — isLoading", () => {
  it("isLoading reflete o estado de useGetUser", () => {
    mockUseGetUser.mockReturnValue({ data: undefined, isLoading: true } as any);

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.isLoading).toBe(true);
  });

  it("isLoading é false quando dados carregaram", () => {
    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.isLoading).toBe(false);
  });
});

describe("useProfileViewModel — dados do usuário", () => {
  it("retorna o name do usuário", () => {
    mockUseGetUser.mockReturnValue({
      data: makeUser({ name: "Maria" }) as any,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.name).toBe("Maria");
  });

  it("retorna o email do usuário", () => {
    mockUseGetUser.mockReturnValue({
      data: makeUser({ email: "maria@example.com" }) as any,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.email).toBe("maria@example.com");
  });

  it("name é string vazia quando user é undefined", () => {
    mockUseGetUser.mockReturnValue({ data: undefined, isLoading: false } as any);

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.name).toBe("");
  });

  it("email é string vazia quando user é undefined", () => {
    mockUseGetUser.mockReturnValue({ data: undefined, isLoading: false } as any);

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.email).toBe("");
  });
});

describe("useProfileViewModel — dados bancários", () => {
  it("bankBalance vem de user.bank.bank", () => {
    mockUseGetUser.mockReturnValue({
      data: makeUser({ bank: 1200 }) as any,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.bankBalance).toBe(1200);
  });

  it("totalDeposit vem de user.bank.totalDeposit", () => {
    mockUseGetUser.mockReturnValue({
      data: makeUser({ totalDeposit: 800 }) as any,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.totalDeposit).toBe(800);
  });

  it("totalWithdrawal vem de user.bank.totalWithdrawal", () => {
    mockUseGetUser.mockReturnValue({
      data: makeUser({ totalWithdrawal: 200 }) as any,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.totalWithdrawal).toBe(200);
  });

  it("profit = bank.profit + bank.totalRake", () => {
    mockUseGetUser.mockReturnValue({
      data: makeUser({ profit: 100, totalRake: 25 }) as any,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.profit).toBe(125);
  });

  it("profit é 0 quando user é undefined", () => {
    mockUseGetUser.mockReturnValue({ data: undefined, isLoading: false } as any);

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.profit).toBe(0);
  });

  it("bankBalance é 0 quando user é undefined", () => {
    mockUseGetUser.mockReturnValue({ data: undefined, isLoading: false } as any);

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.bankBalance).toBe(0);
  });
});
