import { renderHook, act } from "@testing-library/react";
import { useScheduleViewModel } from "../schedule.viewmodel";
import { useCurrency } from "@/services/hooks/useCurrency";
import { useSchedules } from "@/services/hooks/useSchedules";
import { useScheduleItems } from "@/services/hooks/useScheduleItems";
import type { TournamentScheduleItem } from "@/services/hooks/schedule.types";

jest.mock("@/services/hooks/useCurrency");
jest.mock("@/services/hooks/useSchedules");
jest.mock("@/services/hooks/useScheduleItems");

const mockUseCurrency = useCurrency as jest.MockedFunction<typeof useCurrency>;
const mockUseSchedules = useSchedules as jest.MockedFunction<typeof useSchedules>;
const mockUseScheduleItems = useScheduleItems as jest.MockedFunction<typeof useScheduleItems>;

const mockCreateMutate = jest.fn();
const mockDeleteScheduleMutate = jest.fn();
const mockUpdateItemMutate = jest.fn();
const mockDeleteItemMutate = jest.fn();

function makeItem(overrides: Partial<TournamentScheduleItem> = {}): TournamentScheduleItem {
  return {
    id: "item1",
    scheduleId: "s1",
    time: "20:00",
    platform: "PokerStars",
    name: "Sunday Million",
    currency: "USD",
    buyIn: 10,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();

  mockUseCurrency.mockReturnValue({ currencies: { data: { rates: {} } } } as any);
  mockUseSchedules.mockReturnValue({
    getSchedules: { isLoading: false } as any,
    schedules: [],
    createSchedule: { mutate: mockCreateMutate, isPending: false } as any,
    duplicateSchedule: { mutate: jest.fn(), isPending: false } as any,
    deleteSchedule: { mutate: mockDeleteScheduleMutate } as any,
  });
  mockUseScheduleItems.mockReturnValue({
    getItems: { isLoading: false } as any,
    items: [],
    createItem: { mutate: jest.fn() } as any,
    updateItem: { mutate: mockUpdateItemMutate } as any,
    deleteItem: { mutate: mockDeleteItemMutate } as any,
  });
});

describe("useScheduleViewModel — estado inicial", () => {
  it("activeTab começa como WEEKLY", () => {
    const { result } = renderHook(() => useScheduleViewModel());
    expect(result.current.activeTab).toBe("WEEKLY");
  });

  it("activeScheduleId começa como null", () => {
    const { result } = renderHook(() => useScheduleViewModel());
    expect(result.current.activeScheduleId).toBeNull();
  });

  it("isCreatingScheduleForm começa como false", () => {
    const { result } = renderHook(() => useScheduleViewModel());
    expect(result.current.isCreatingScheduleForm).toBe(false);
  });

  it("newScheduleName começa vazio", () => {
    const { result } = renderHook(() => useScheduleViewModel());
    expect(result.current.newScheduleName).toBe("");
  });

  it("scheduleToDelete começa como null", () => {
    const { result } = renderHook(() => useScheduleViewModel());
    expect(result.current.scheduleToDelete).toBeNull();
  });

  it("editingItemId começa como null", () => {
    const { result } = renderHook(() => useScheduleViewModel());
    expect(result.current.editingItemId).toBeNull();
  });

  it("selectedItemId começa como null", () => {
    const { result } = renderHook(() => useScheduleViewModel());
    expect(result.current.selectedItemId).toBeNull();
  });
});

describe("useScheduleViewModel — onTabChange", () => {
  it("atualiza activeTab", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onTabChange("SUNDAY"));

    expect(result.current.activeTab).toBe("SUNDAY");
  });

  it("reseta activeScheduleId ao trocar de tab", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onSelectSchedule("s1"));
    act(() => result.current.onTabChange("SUNDAY"));

    expect(result.current.activeScheduleId).toBeNull();
  });

  it("reseta isCreatingScheduleForm ao trocar de tab", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onStartCreateSchedule());
    act(() => result.current.onTabChange("SUNDAY"));

    expect(result.current.isCreatingScheduleForm).toBe(false);
  });

  it("reseta newScheduleName ao trocar de tab", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onNewScheduleNameChange("Minha Grade"));
    act(() => result.current.onTabChange("SUNDAY"));

    expect(result.current.newScheduleName).toBe("");
  });
});

describe("useScheduleViewModel — seleção de schedule", () => {
  it("onSelectSchedule define activeScheduleId", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onSelectSchedule("abc"));

    expect(result.current.activeScheduleId).toBe("abc");
  });

  it("onSelectSchedule reseta editingItemId", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onStartEditItem(makeItem({ id: "item1" })));
    act(() => result.current.onSelectSchedule("s2"));

    expect(result.current.editingItemId).toBeNull();
  });
});

describe("useScheduleViewModel — criar schedule", () => {
  it("onStartCreateSchedule ativa o formulário de criação", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onStartCreateSchedule());

    expect(result.current.isCreatingScheduleForm).toBe(true);
  });

  it("onCancelCreateSchedule desativa o formulário e limpa o nome", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onStartCreateSchedule());
    act(() => result.current.onNewScheduleNameChange("Teste"));
    act(() => result.current.onCancelCreateSchedule());

    expect(result.current.isCreatingScheduleForm).toBe(false);
    expect(result.current.newScheduleName).toBe("");
  });

  it("onNewScheduleNameChange atualiza newScheduleName", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onNewScheduleNameChange("Grade Domingo"));

    expect(result.current.newScheduleName).toBe("Grade Domingo");
  });

  it("onConfirmCreateSchedule chama mutate com name e activeTab", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onNewScheduleNameChange("Grade Teste"));
    act(() => result.current.onConfirmCreateSchedule());

    expect(mockCreateMutate).toHaveBeenCalledWith(
      { name: "Grade Teste", type: "WEEKLY" },
      expect.any(Object),
    );
  });

  it("onConfirmCreateSchedule ignora nome vazio", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onConfirmCreateSchedule());

    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  it("onConfirmCreateSchedule ignora nome com apenas espaços", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onNewScheduleNameChange("   "));
    act(() => result.current.onConfirmCreateSchedule());

    expect(mockCreateMutate).not.toHaveBeenCalled();
  });
});

describe("useScheduleViewModel — deletar schedule", () => {
  it("onSelectScheduleToDelete define scheduleToDelete", () => {
    const schedule = { id: "s1", name: "Grade A", type: "WEEKLY" as const };
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onSelectScheduleToDelete(schedule));

    expect(result.current.scheduleToDelete).toEqual(schedule);
  });

  it("onSelectScheduleToDelete aceita null para limpar", () => {
    const schedule = { id: "s1", name: "Grade A", type: "WEEKLY" as const };
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onSelectScheduleToDelete(schedule));
    act(() => result.current.onSelectScheduleToDelete(null));

    expect(result.current.scheduleToDelete).toBeNull();
  });

  it("onConfirmDeleteSchedule chama mutate com o id da grade", () => {
    const schedule = { id: "s1", name: "Grade A", type: "WEEKLY" as const };
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onSelectScheduleToDelete(schedule));
    act(() => result.current.onConfirmDeleteSchedule());

    expect(mockDeleteScheduleMutate).toHaveBeenCalledWith("s1", expect.any(Object));
  });

  it("onConfirmDeleteSchedule não chama mutate quando scheduleToDelete é null", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onConfirmDeleteSchedule());

    expect(mockDeleteScheduleMutate).not.toHaveBeenCalled();
  });
});

describe("useScheduleViewModel — edição de item", () => {
  it("onStartEditItem define editingItemId e inicializa o draft", () => {
    const item = makeItem({ id: "item1", time: "19:00", platform: "GGPoker" });
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onStartEditItem(item));

    expect(result.current.editingItemId).toBe("item1");
    expect(result.current.editDraftById["item1"]).toMatchObject({
      time: "19:00",
      platform: "GGPoker",
    });
  });

  it("onStartEditItem não faz nada quando item não tem id", () => {
    const item = makeItem({ id: undefined });
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onStartEditItem(item));

    expect(result.current.editingItemId).toBeNull();
  });

  it("onChangeEditDraft atualiza campos do draft", () => {
    const item = makeItem({ id: "item1" });
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onStartEditItem(item));
    act(() => result.current.onChangeEditDraft("item1", { platform: "888Poker" }));

    expect(result.current.editDraftById["item1"]?.platform).toBe("888Poker");
  });

  it("onCancelEditItem limpa editingItemId e o draft do item", () => {
    const item = makeItem({ id: "item1" });
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onStartEditItem(item));
    act(() => result.current.onCancelEditItem("item1"));

    expect(result.current.editingItemId).toBeNull();
    expect(result.current.editDraftById["item1"]).toBeUndefined();
  });

  it("onSaveEditItem chama updateItem.mutate quando há alterações", () => {
    const item = makeItem({ id: "item1", platform: "PokerStars" });
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onStartEditItem(item));
    act(() => result.current.onChangeEditDraft("item1", { platform: "GGPoker" }));
    act(() => result.current.onSaveEditItem(item));

    expect(mockUpdateItemMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "item1" }),
      expect.any(Object),
    );
  });

  it("onSaveEditItem não chama mutate quando não há alterações", () => {
    const item = makeItem({ id: "item1" });
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onStartEditItem(item));
    act(() => result.current.onSaveEditItem(item));

    expect(mockUpdateItemMutate).not.toHaveBeenCalled();
  });
});

describe("useScheduleViewModel — deleção de item", () => {
  it("onSelectItemToDelete define selectedItemId", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onSelectItemToDelete("item1"));

    expect(result.current.selectedItemId).toBe("item1");
  });

  it("onCloseDeleteItemModal limpa selectedItemId", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onSelectItemToDelete("item1"));
    act(() => result.current.onCloseDeleteItemModal());

    expect(result.current.selectedItemId).toBeNull();
  });

  it("onConfirmDeleteItem chama deleteItem.mutate com o id selecionado", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onSelectItemToDelete("item1"));
    act(() => result.current.onConfirmDeleteItem());

    expect(mockDeleteItemMutate).toHaveBeenCalledWith("item1");
  });

  it("onConfirmDeleteItem não chama mutate quando selectedItemId é null", () => {
    const { result } = renderHook(() => useScheduleViewModel());

    act(() => result.current.onConfirmDeleteItem());

    expect(mockDeleteItemMutate).not.toHaveBeenCalled();
  });
});

describe("useScheduleViewModel — valores derivados", () => {
  it("total reflete o número de itens", () => {
    mockUseScheduleItems.mockReturnValue({
      getItems: { isLoading: false } as any,
      items: [makeItem(), makeItem({ id: "item2" })],
      createItem: { mutate: jest.fn() } as any,
      updateItem: { mutate: mockUpdateItemMutate } as any,
      deleteItem: { mutate: mockDeleteItemMutate } as any,
    });

    const { result } = renderHook(() => useScheduleViewModel());

    expect(result.current.total).toBe(2);
  });

  it("totalBuyIns soma os buyIn de todos os itens", () => {
    mockUseScheduleItems.mockReturnValue({
      getItems: { isLoading: false } as any,
      items: [makeItem({ buyIn: 10 }), makeItem({ id: "item2", buyIn: 25 })],
      createItem: { mutate: jest.fn() } as any,
      updateItem: { mutate: mockUpdateItemMutate } as any,
      deleteItem: { mutate: mockDeleteItemMutate } as any,
    });

    const { result } = renderHook(() => useScheduleViewModel());

    expect(result.current.totalBuyIns).toBe(35);
  });

  it("buyInSummary agrupa e ordena por buyIn crescente", () => {
    mockUseScheduleItems.mockReturnValue({
      getItems: { isLoading: false } as any,
      items: [
        makeItem({ buyIn: 25 }),
        makeItem({ id: "i2", buyIn: 10 }),
        makeItem({ id: "i3", buyIn: 10 }),
      ],
      createItem: { mutate: jest.fn() } as any,
      updateItem: { mutate: mockUpdateItemMutate } as any,
      deleteItem: { mutate: mockDeleteItemMutate } as any,
    });

    const { result } = renderHook(() => useScheduleViewModel());

    expect(result.current.buyInSummary).toEqual([
      { buyIn: 10, count: 2 },
      { buyIn: 25, count: 1 },
    ]);
  });

  it("platformSummary agrupa e ordena por contagem decrescente", () => {
    mockUseScheduleItems.mockReturnValue({
      getItems: { isLoading: false } as any,
      items: [
        makeItem({ platform: "GGPoker", buyIn: 10 }),
        makeItem({ id: "i2", platform: "GGPoker", buyIn: 10 }),
        makeItem({ id: "i3", platform: "PokerStars", buyIn: 25 }),
      ],
      createItem: { mutate: jest.fn() } as any,
      updateItem: { mutate: mockUpdateItemMutate } as any,
      deleteItem: { mutate: mockDeleteItemMutate } as any,
    });

    const { result } = renderHook(() => useScheduleViewModel());

    expect(result.current.platformSummary[0].platform).toBe("GGPoker");
    expect(result.current.platformSummary[0].count).toBe(2);
    expect(result.current.platformSummary[1].platform).toBe("PokerStars");
  });

  it("plataforma vazia aparece como '—' no platformSummary", () => {
    mockUseScheduleItems.mockReturnValue({
      getItems: { isLoading: false } as any,
      items: [makeItem({ platform: "" })],
      createItem: { mutate: jest.fn() } as any,
      updateItem: { mutate: mockUpdateItemMutate } as any,
      deleteItem: { mutate: mockDeleteItemMutate } as any,
    });

    const { result } = renderHook(() => useScheduleViewModel());

    expect(result.current.platformSummary[0].platform).toBe("—");
  });
});
