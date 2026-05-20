import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScheduleView } from "../Schedule.view";
import { useScheduleViewModel } from "../schedule.viewmodel";
import type { ScheduleViewProps } from "../schedule.types";

jest.mock("../schedule.viewmodel");
jest.mock("../components/scheduleForm", () => ({
  ScheduleForm: () => <div data-testid="schedule-form" />,
}));
jest.mock("../components/deleteScheduleModal", () => ({
  DeleteScheduleModal: ({
    isOpen,
    onRequestClose,
    onDelete,
  }: {
    isOpen: boolean;
    onRequestClose: () => void;
    onDelete: () => void;
  }) =>
    isOpen ? (
      <div data-testid="delete-modal">
        <button onClick={onDelete}>Confirmar</button>
        <button onClick={onRequestClose}>Fechar</button>
      </div>
    ) : null,
}));

const mockViewModel = useScheduleViewModel as jest.MockedFunction<typeof useScheduleViewModel>;

function makeItem(overrides: Partial<ScheduleViewProps["list"][number]> = {}) {
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

function baseProps(overrides: Partial<ScheduleViewProps> = {}): ScheduleViewProps {
  return {
    activeTab: "WEEKLY",
    onTabChange: jest.fn(),

    isLoadingSchedules: false,
    schedules: [],
    activeScheduleId: null,
    onSelectSchedule: jest.fn(),

    newScheduleName: "",
    isCreatingScheduleForm: false,
    isCreatingSchedule: false,
    onNewScheduleNameChange: jest.fn(),
    onStartCreateSchedule: jest.fn(),
    onCancelCreateSchedule: jest.fn(),
    onConfirmCreateSchedule: jest.fn(),

    scheduleToDelete: null,
    onSelectScheduleToDelete: jest.fn(),
    onConfirmDeleteSchedule: jest.fn(),

    isLoadingItems: false,
    total: 0,
    totalBuyIns: 0,
    totalBuyInsBrl: undefined,
    list: [],
    buyInSummary: [],
    platformSummary: [],

    selectedItemId: null,
    editingItemId: null,
    savingItemId: null,
    editDraftById: {},

    onSelectItemToDelete: jest.fn(),
    onConfirmDeleteItem: jest.fn(),
    onCloseDeleteItemModal: jest.fn(),

    onStartEditItem: jest.fn(),
    onChangeEditDraft: jest.fn(),
    onCancelEditItem: jest.fn(),
    onSaveEditItem: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockViewModel.mockReturnValue(baseProps());
});

describe("ScheduleView — cabeçalho", () => {
  it("exibe o título 'Grade'", () => {
    render(<ScheduleView />);

    expect(screen.getByText("Grade")).toBeInTheDocument();
  });

  it("exibe os botões de tab 'Semanal' e 'Domingo'", () => {
    render(<ScheduleView />);

    expect(screen.getByRole("button", { name: "Semanal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Domingo" })).toBeInTheDocument();
  });

  it("chama onTabChange ao clicar em 'Domingo'", async () => {
    const onTabChange = jest.fn();
    mockViewModel.mockReturnValue(baseProps({ onTabChange }));

    render(<ScheduleView />);
    await userEvent.click(screen.getByRole("button", { name: "Domingo" }));

    expect(onTabChange).toHaveBeenCalledWith("SUNDAY");
  });

  it("chama onTabChange ao clicar em 'Semanal'", async () => {
    const onTabChange = jest.fn();
    mockViewModel.mockReturnValue(baseProps({ activeTab: "SUNDAY", onTabChange }));

    render(<ScheduleView />);
    await userEvent.click(screen.getByRole("button", { name: "Semanal" }));

    expect(onTabChange).toHaveBeenCalledWith("WEEKLY");
  });
});

describe("ScheduleView — seletor de grades", () => {
  it("exibe 'Carregando grades...' quando isLoadingSchedules é true", () => {
    mockViewModel.mockReturnValue(baseProps({ isLoadingSchedules: true }));

    render(<ScheduleView />);

    expect(screen.getByText(/carregando grades/i)).toBeInTheDocument();
  });

  it("exibe botão 'Nova grade' quando não está carregando", () => {
    render(<ScheduleView />);

    expect(screen.getByRole("button", { name: /nova grade/i })).toBeInTheDocument();
  });

  it("exibe chip de grade quando há schedules", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
      }),
    );

    render(<ScheduleView />);

    expect(screen.getByText("Grade A")).toBeInTheDocument();
  });

  it("chama onSelectSchedule ao clicar no nome da grade", async () => {
    const onSelectSchedule = jest.fn();
    mockViewModel.mockReturnValue(
      baseProps({
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        onSelectSchedule,
      }),
    );

    render(<ScheduleView />);
    await userEvent.click(screen.getByText("Grade A"));

    expect(onSelectSchedule).toHaveBeenCalledWith("s1");
  });

  it("chama onSelectScheduleToDelete ao clicar no botão de remover grade", async () => {
    const onSelectScheduleToDelete = jest.fn();
    mockViewModel.mockReturnValue(
      baseProps({
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        onSelectScheduleToDelete,
      }),
    );

    render(<ScheduleView />);
    await userEvent.click(screen.getByRole("button", { name: /remover grade Grade A/i }));

    expect(onSelectScheduleToDelete).toHaveBeenCalledWith({ id: "s1", name: "Grade A", type: "WEEKLY" });
  });

  it("chama onStartCreateSchedule ao clicar em 'Nova grade'", async () => {
    const onStartCreateSchedule = jest.fn();
    mockViewModel.mockReturnValue(baseProps({ onStartCreateSchedule }));

    render(<ScheduleView />);
    await userEvent.click(screen.getByRole("button", { name: /nova grade/i }));

    expect(onStartCreateSchedule).toHaveBeenCalledTimes(1);
  });

  it("exibe formulário de criação quando isCreatingScheduleForm é true", () => {
    mockViewModel.mockReturnValue(
      baseProps({ isCreatingScheduleForm: true, newScheduleName: "" }),
    );

    render(<ScheduleView />);

    expect(screen.getByPlaceholderText(/nome da grade/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirmar criação/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  it("chama onCancelCreateSchedule ao clicar em cancelar no formulário", async () => {
    const onCancelCreateSchedule = jest.fn();
    mockViewModel.mockReturnValue(
      baseProps({ isCreatingScheduleForm: true, onCancelCreateSchedule }),
    );

    render(<ScheduleView />);
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(onCancelCreateSchedule).toHaveBeenCalledTimes(1);
  });
});

describe("ScheduleView — estado sem grade selecionada", () => {
  it("exibe mensagem 'Crie uma grade para começar.' quando não há grades", () => {
    render(<ScheduleView />);

    expect(screen.getByText(/crie uma grade para começar/i)).toBeInTheDocument();
  });

  it("exibe mensagem de seleção quando há grades mas nenhuma selecionada", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        activeScheduleId: null,
      }),
    );

    render(<ScheduleView />);

    expect(screen.getByText(/selecione uma grade acima/i)).toBeInTheDocument();
  });
});

describe("ScheduleView — detalhe da grade selecionada", () => {
  it("exibe o ScheduleForm quando há activeScheduleId", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        activeScheduleId: "s1",
      }),
    );

    render(<ScheduleView />);

    expect(screen.getByTestId("schedule-form")).toBeInTheDocument();
  });

  it("exibe o nome da grade selecionada acima da tabela", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        activeScheduleId: "s1",
      }),
    );

    render(<ScheduleView />);

    expect(screen.getAllByText("Grade A").length).toBeGreaterThanOrEqual(1);
  });

  it("exibe 'Carregando...' quando isLoadingItems é true", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        activeScheduleId: "s1",
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        isLoadingItems: true,
      }),
    );

    render(<ScheduleView />);

    expect(screen.getByText(/carregando\.\.\./i)).toBeInTheDocument();
  });

  it("exibe 'Nenhum torneio na grade' quando a lista está vazia", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        activeScheduleId: "s1",
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        list: [],
      }),
    );

    render(<ScheduleView />);

    expect(screen.getByText(/nenhum torneio na grade/i)).toBeInTheDocument();
  });

  it("exibe as colunas da tabela de itens", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        activeScheduleId: "s1",
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        list: [],
      }),
    );

    render(<ScheduleView />);

    expect(screen.getByText("Horário")).toBeInTheDocument();
    expect(screen.getByText("Plataforma")).toBeInTheDocument();
    expect(screen.getByText("Torneio")).toBeInTheDocument();
    expect(screen.getByText("Buy-in")).toBeInTheDocument();
  });

  it("exibe dados do item na tabela", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        activeScheduleId: "s1",
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        list: [makeItem({ id: "item1", time: "20:00", platform: "GGPoker", name: "Sunday Million", buyIn: 25 })],
        total: 1,
        totalBuyIns: 25,
      }),
    );

    render(<ScheduleView />);

    expect(screen.getByText("20:00")).toBeInTheDocument();
    expect(screen.getByText("GGPoker")).toBeInTheDocument();
    expect(screen.getByText("Sunday Million")).toBeInTheDocument();
  });

  it("chama onStartEditItem ao clicar em Editar", async () => {
    const onStartEditItem = jest.fn();
    const item = makeItem({ id: "item1" });
    mockViewModel.mockReturnValue(
      baseProps({
        activeScheduleId: "s1",
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        list: [item],
        onStartEditItem,
      }),
    );

    render(<ScheduleView />);
    await userEvent.click(screen.getByRole("button", { name: /editar/i }));

    expect(onStartEditItem).toHaveBeenCalledWith(item);
  });

  it("chama onSelectItemToDelete ao clicar em Remover", async () => {
    const onSelectItemToDelete = jest.fn();
    const item = makeItem({ id: "item1" });
    mockViewModel.mockReturnValue(
      baseProps({
        activeScheduleId: "s1",
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        list: [item],
        onSelectItemToDelete,
      }),
    );

    render(<ScheduleView />);
    await userEvent.click(screen.getByRole("button", { name: "Remover" }));

    expect(onSelectItemToDelete).toHaveBeenCalledWith("item1");
  });

  it("exibe inputs de edição quando o item está sendo editado", () => {
    const item = makeItem({ id: "item1", platform: "PokerStars", time: "20:00" });
    mockViewModel.mockReturnValue(
      baseProps({
        activeScheduleId: "s1",
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        list: [item],
        editingItemId: "item1",
        editDraftById: {
          item1: { time: "20:00", platform: "PokerStars", name: "Sunday Million", currency: "USD", buyIn: 10 },
        },
      }),
    );

    render(<ScheduleView />);

    expect(screen.getByRole("button", { name: /salvar/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /cancelar/i }).length).toBeGreaterThanOrEqual(1);
  });
});

describe("ScheduleView — resumo de buy-ins e plataformas", () => {
  it("exibe 'Resumo por Buy-in' quando buyInSummary tem dados", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        activeScheduleId: "s1",
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        buyInSummary: [{ buyIn: 10, count: 2 }],
        platformSummary: [],
      }),
    );

    render(<ScheduleView />);

    expect(screen.getByText(/resumo por buy-in/i)).toBeInTheDocument();
  });

  it("exibe 'Resumo por Plataforma' quando platformSummary tem dados", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        activeScheduleId: "s1",
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        buyInSummary: [],
        platformSummary: [{ platform: "GGPoker", count: 2, totalBuyIn: 20 }],
      }),
    );

    render(<ScheduleView />);

    expect(screen.getByText(/resumo por plataforma/i)).toBeInTheDocument();
  });

  it("não exibe resumos quando ambos estão vazios", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        activeScheduleId: "s1",
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        buyInSummary: [],
        platformSummary: [],
      }),
    );

    render(<ScheduleView />);

    expect(screen.queryByText(/resumo por buy-in/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/resumo por plataforma/i)).not.toBeInTheDocument();
  });
});

describe("ScheduleView — totais no cabeçalho", () => {
  it("exibe total de torneios quando há activeScheduleId e total > 0", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        activeScheduleId: "s1",
        schedules: [{ id: "s1", name: "Grade A", type: "WEEKLY" }],
        total: 3,
        totalBuyIns: 30,
      }),
    );

    render(<ScheduleView />);

    expect(screen.getByText(/total: 3 torneios/i)).toBeInTheDocument();
    expect(screen.getByText(/total buy-ins: \$ 30\.00/i)).toBeInTheDocument();
  });

  it("não exibe totais quando não há grade selecionada", () => {
    mockViewModel.mockReturnValue(baseProps({ activeScheduleId: null, total: 5 }));

    render(<ScheduleView />);

    expect(screen.queryByText(/total buy-ins/i)).not.toBeInTheDocument();
  });
});

describe("ScheduleView — modais de deleção", () => {
  it("exibe modal de deleção de item quando selectedItemId não é null", () => {
    mockViewModel.mockReturnValue(baseProps({ selectedItemId: "item1" }));

    render(<ScheduleView />);

    expect(screen.getAllByTestId("delete-modal").length).toBeGreaterThanOrEqual(1);
  });

  it("exibe modal de deleção de grade quando scheduleToDelete não é null", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        scheduleToDelete: { id: "s1", name: "Grade A", type: "WEEKLY" },
      }),
    );

    render(<ScheduleView />);

    expect(screen.getAllByTestId("delete-modal").length).toBeGreaterThanOrEqual(1);
  });

  it("chama onConfirmDeleteItem ao confirmar no modal de item", async () => {
    const onConfirmDeleteItem = jest.fn();
    mockViewModel.mockReturnValue(
      baseProps({ selectedItemId: "item1", onConfirmDeleteItem }),
    );

    render(<ScheduleView />);
    await userEvent.click(screen.getAllByRole("button", { name: /confirmar/i })[0]);

    expect(onConfirmDeleteItem).toHaveBeenCalledTimes(1);
  });

  it("chama onCloseDeleteItemModal ao fechar modal de item", async () => {
    const onCloseDeleteItemModal = jest.fn();
    mockViewModel.mockReturnValue(
      baseProps({ selectedItemId: "item1", onCloseDeleteItemModal }),
    );

    render(<ScheduleView />);
    await userEvent.click(screen.getAllByRole("button", { name: /fechar/i })[0]);

    expect(onCloseDeleteItemModal).toHaveBeenCalledTimes(1);
  });
});
