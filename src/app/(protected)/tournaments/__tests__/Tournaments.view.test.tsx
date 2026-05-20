import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TournamentsView } from "../Tournaments.view";
import { useTournamentsViewModel } from "../tournaments.viewmodel";
import type { TournamentsViewProps } from "../tournaments.types";
import type { Tournament } from "@/services/hooks/types";

jest.mock("../tournaments.viewmodel");
jest.mock("../components/tournamentForm", () => ({
  TournamentForm: () => <div data-testid="tournament-form" />,
}));
jest.mock("../components/deleteTournamentModal", () => ({
  DeleteTournamentModal: () => null,
}));
jest.mock("../components/importScheduleModal", () => ({
  ImportScheduleModal: () => null,
}));
jest.mock("../components/finalizeTournamentDay2Modal", () => ({
  FinalizeTournamentDay2Modal: () => null,
}));
jest.mock("../components/filterTournaments", () => ({
  FilterTournaments: () => <div data-testid="filter-tournaments" />,
}));

const mockViewModel = useTournamentsViewModel as jest.MockedFunction<typeof useTournamentsViewModel>;

function makeTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: "t1",
    date: "2026-05-01T12:00:00.000Z",
    platform: "PokerStars",
    name: "Sunday Million",
    currency: "USD",
    buyIn: 10,
    result: 25,
    itm: false,
    hasFt: false,
    hasSecondDay: false,
    position: null,
    ...overrides,
  };
}

function baseProps(overrides: Partial<TournamentsViewProps> = {}): TournamentsViewProps {
  return {
    isLoading: false,
    total: 0,
    totalPages: 1,
    currentPage: 1,
    currentPageData: [],
    paginationPages: [],
    platform: "",
    hasActiveFilter: false,
    filteredProfit: null,
    isOpenFilter: false,
    selectedTournamentId: null,
    editingTournamentId: null,
    editDraftById: {},
    savingTournamentId: null,
    eurToUsdRate: 1,
    isImportScheduleModalOpen: false,
    isImportingSchedule: false,
    day2Tournaments: [],
    isLoadingDay2: false,
    tournamentToFinalize: null,
    isFinalizingDay2: false,
    nameInput: "",
    onOpenFinalizeDay2Modal: jest.fn(),
    onCloseFinalizeDay2Modal: jest.fn(),
    onConfirmFinalizeDay2: jest.fn(),
    onFilterToggle: jest.fn(),
    onNameChange: jest.fn(),
    onPlatformChange: jest.fn(),
    onClearFilter: jest.fn(),
    onPageChange: jest.fn(),
    onSelectTournamentToDelete: jest.fn(),
    onConfirmDelete: jest.fn(),
    onCloseDeleteModal: jest.fn(),
    onOpenImportScheduleModal: jest.fn(),
    onCloseImportScheduleModal: jest.fn(),
    onConfirmImportSchedule: jest.fn(),
    onStartEditTournament: jest.fn(),
    onChangeEditDraft: jest.fn(),
    onCancelEditTournament: jest.fn(),
    onSaveEditTournament: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mockViewModel.mockReturnValue(baseProps());
});

describe("TournamentsView — loading", () => {
  it("exibe 'Carregando...' quando isLoading é true", () => {
    mockViewModel.mockReturnValue(baseProps({ isLoading: true }));

    render(<TournamentsView />);

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it("não exibe o título 'Torneios' quando isLoading é true", () => {
    mockViewModel.mockReturnValue(baseProps({ isLoading: true }));

    render(<TournamentsView />);

    expect(screen.queryByRole("heading", { name: /torneios/i })).not.toBeInTheDocument();
  });
});

describe("TournamentsView — header e contador", () => {
  it("exibe o heading 'Torneios'", () => {
    render(<TournamentsView />);

    expect(screen.getByRole("heading", { name: /torneios/i })).toBeInTheDocument();
  });

  it("não exibe contador quando total é 0", () => {
    render(<TournamentsView />);

    expect(screen.queryByText(/total:/i)).not.toBeInTheDocument();
  });

  it("exibe contador no plural quando total > 1", () => {
    mockViewModel.mockReturnValue(baseProps({ total: 5 }));

    render(<TournamentsView />);

    expect(screen.getByText(/total:\s*5 torneios/i)).toBeInTheDocument();
  });

  it("exibe contador no singular quando total é 1", () => {
    mockViewModel.mockReturnValue(baseProps({ total: 1 }));

    render(<TournamentsView />);

    expect(screen.getByText(/total:\s*1 torneio(?!s)/i)).toBeInTheDocument();
  });
});

describe("TournamentsView — tabela de torneios", () => {
  it("exibe 'Nenhum torneio encontrado' quando currentPageData está vazio", () => {
    render(<TournamentsView />);

    expect(screen.getByText(/nenhum torneio encontrado/i)).toBeInTheDocument();
  });

  it("exibe nome e plataforma dos torneios na tabela", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        currentPageData: [makeTournament({ name: "Sunday Million", platform: "PokerStars" })],
      }),
    );

    render(<TournamentsView />);

    expect(screen.getByText("Sunday Million")).toBeInTheDocument();
    expect(screen.getByText("PokerStars")).toBeInTheDocument();
  });

  it("exibe buy-in formatado em USD", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        currentPageData: [makeTournament({ buyIn: 10.5, currency: "USD" })],
      }),
    );

    render(<TournamentsView />);

    expect(screen.getAllByText(/\$\s*10\.50/).length).toBeGreaterThan(0);
  });

  it("exibe 'ticket' quando buy-in é 'ticket'", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        currentPageData: [makeTournament({ buyIn: "ticket" })],
      }),
    );

    render(<TournamentsView />);

    expect(screen.getAllByText("ticket").length).toBeGreaterThan(0);
  });

  it("exibe profit positivo com classe text-green-500", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        currentPageData: [makeTournament({ buyIn: 10, result: 50, currency: "USD" })],
      }),
    );

    render(<TournamentsView />);

    const profitCell = screen.getByText(/\$\s*40\.00/);
    expect(profitCell.closest("td")).toHaveClass("text-green-500");
  });

  it("exibe profit negativo com classe text-red-500", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        currentPageData: [makeTournament({ buyIn: 10, result: 0, currency: "USD" })],
      }),
    );

    render(<TournamentsView />);

    const profitCell = screen.getByText(/\$\s*-10\.00|\$ -10\.00|-\$\s*10\.00/);
    expect(profitCell.closest("td")).toHaveClass("text-red-500");
  });

  it("exibe posição do torneio quando position não é null", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        currentPageData: [makeTournament({ position: 3 })],
      }),
    );

    render(<TournamentsView />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("exibe '-' quando position é null", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        currentPageData: [makeTournament({ position: null })],
      }),
    );

    render(<TournamentsView />);

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("exibe múltiplos torneios na tabela", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        currentPageData: [
          makeTournament({ id: "t1", name: "Main Event" }),
          makeTournament({ id: "t2", name: "High Roller" }),
        ],
      }),
    );

    render(<TournamentsView />);

    expect(screen.getByText("Main Event")).toBeInTheDocument();
    expect(screen.getByText("High Roller")).toBeInTheDocument();
  });
});

describe("TournamentsView — modo de edição", () => {
  it("botão editar chama onStartEditTournament com o torneio", async () => {
    const tournament = makeTournament({ id: "t1" });
    const onStartEditTournament = jest.fn();
    mockViewModel.mockReturnValue(baseProps({ currentPageData: [tournament], onStartEditTournament }));

    render(<TournamentsView />);

    await userEvent.click(screen.getByRole("button", { name: /editar torneio/i }));

    expect(onStartEditTournament).toHaveBeenCalledWith(tournament);
  });

  it("exibe inputs de edição quando torneio está em modo de edição", () => {
    const tournament = makeTournament({ id: "t1", platform: "PokerStars", name: "Sunday" });
    mockViewModel.mockReturnValue(
      baseProps({
        currentPageData: [tournament],
        editingTournamentId: "t1",
        editDraftById: {
          t1: {
            date: "2026-05-01T12:00:00.000Z",
            platform: "PokerStars",
            name: "Sunday",
            currency: "USD",
            buyIn: 10,
            result: 25,
            itm: false,
            hasFt: false,
            hasSecondDay: false,
            position: "",
          },
        },
      }),
    );

    render(<TournamentsView />);

    const platformInput = screen.getByDisplayValue("PokerStars");
    expect(platformInput).toBeInTheDocument();
  });

  it("exibe botões salvar e cancelar no modo de edição", () => {
    const tournament = makeTournament({ id: "t1" });
    mockViewModel.mockReturnValue(
      baseProps({
        currentPageData: [tournament],
        editingTournamentId: "t1",
        editDraftById: {
          t1: {
            date: "2026-05-01T12:00:00.000Z",
            platform: "PokerStars",
            name: "Sunday",
            currency: "USD",
            buyIn: 10,
            result: 25,
            itm: false,
            hasFt: false,
            hasSecondDay: false,
            position: "",
          },
        },
      }),
    );

    render(<TournamentsView />);

    expect(screen.getByRole("button", { name: /salvar edição/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar edição/i })).toBeInTheDocument();
  });

  it("botão cancelar chama onCancelEditTournament com o id", async () => {
    const tournament = makeTournament({ id: "t1" });
    const onCancelEditTournament = jest.fn();
    mockViewModel.mockReturnValue(
      baseProps({
        currentPageData: [tournament],
        editingTournamentId: "t1",
        editDraftById: {
          t1: {
            date: "2026-05-01T12:00:00.000Z",
            platform: "PokerStars",
            name: "Sunday",
            currency: "USD",
            buyIn: 10,
            result: 25,
            itm: false,
            hasFt: false,
            hasSecondDay: false,
            position: "",
          },
        },
        onCancelEditTournament,
      }),
    );

    render(<TournamentsView />);

    await userEvent.click(screen.getByRole("button", { name: /cancelar edição/i }));

    expect(onCancelEditTournament).toHaveBeenCalledWith("t1");
  });
});

describe("TournamentsView — seção Dia 2", () => {
  it("não exibe seção 'Aguardando Dia 2' quando não há torneios e não está carregando", () => {
    render(<TournamentsView />);

    expect(screen.queryByText(/aguardando dia 2/i)).not.toBeInTheDocument();
  });

  it("exibe seção 'Aguardando Dia 2' quando há torneios com dia 2 pendente", () => {
    const day2Tournament = makeTournament({ id: "t1", hasSecondDay: true });
    mockViewModel.mockReturnValue(baseProps({ day2Tournaments: [day2Tournament] }));

    render(<TournamentsView />);

    expect(screen.getByText(/aguardando dia 2/i)).toBeInTheDocument();
  });

  it("exibe seção 'Aguardando Dia 2' quando isLoadingDay2 é true", () => {
    mockViewModel.mockReturnValue(baseProps({ isLoadingDay2: true }));

    render(<TournamentsView />);

    expect(screen.getByText(/aguardando dia 2/i)).toBeInTheDocument();
  });

  it("exibe nome do torneio no dia 2 pendente", () => {
    const day2Tournament = makeTournament({ id: "t1", name: "Main Event Day 2", hasSecondDay: true });
    mockViewModel.mockReturnValue(baseProps({ day2Tournaments: [day2Tournament] }));

    render(<TournamentsView />);

    expect(screen.getByText("Main Event Day 2")).toBeInTheDocument();
  });

  it("exibe contagem de torneios no badge da seção Dia 2", () => {
    const day2Tournaments = [
      makeTournament({ id: "t1", hasSecondDay: true }),
      makeTournament({ id: "t2", hasSecondDay: true }),
    ];
    mockViewModel.mockReturnValue(baseProps({ day2Tournaments }));

    render(<TournamentsView />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("botão 'Finalizar' chama onOpenFinalizeDay2Modal com o torneio", async () => {
    const day2Tournament = makeTournament({ id: "t1", hasSecondDay: true });
    const onOpenFinalizeDay2Modal = jest.fn();
    mockViewModel.mockReturnValue(
      baseProps({ day2Tournaments: [day2Tournament], onOpenFinalizeDay2Modal }),
    );

    render(<TournamentsView />);

    await userEvent.click(screen.getByRole("button", { name: /finalizar/i }));

    expect(onOpenFinalizeDay2Modal).toHaveBeenCalledWith(day2Tournament);
  });
});

describe("TournamentsView — filtros", () => {
  it("não exibe painel de filtros quando isOpenFilter é false", () => {
    render(<TournamentsView />);

    expect(screen.queryByTestId("filter-tournaments")).not.toBeInTheDocument();
  });

  it("exibe painel de filtros quando isOpenFilter é true", () => {
    mockViewModel.mockReturnValue(baseProps({ isOpenFilter: true }));

    render(<TournamentsView />);

    expect(screen.getByTestId("filter-tournaments")).toBeInTheDocument();
  });

  it("botão 'Filtros' chama onFilterToggle", async () => {
    const onFilterToggle = jest.fn();
    mockViewModel.mockReturnValue(baseProps({ onFilterToggle }));

    render(<TournamentsView />);

    await userEvent.click(screen.getByRole("button", { name: /filtros/i }));

    expect(onFilterToggle).toHaveBeenCalled();
  });

  it("não exibe 'Profit filtrado' quando hasActiveFilter é false", () => {
    render(<TournamentsView />);

    expect(screen.queryByText(/profit filtrado/i)).not.toBeInTheDocument();
  });

  it("exibe 'Profit filtrado' quando hasActiveFilter é true e filteredProfit não é null", () => {
    mockViewModel.mockReturnValue(
      baseProps({ hasActiveFilter: true, filteredProfit: 45.5 }),
    );

    render(<TournamentsView />);

    expect(screen.getByText(/profit filtrado/i)).toBeInTheDocument();
  });

  it("exibe valor positivo do filteredProfit com prefixo '+'", () => {
    mockViewModel.mockReturnValue(
      baseProps({ hasActiveFilter: true, filteredProfit: 30.0 }),
    );

    render(<TournamentsView />);

    expect(screen.getByText(/\+30\.00/)).toBeInTheDocument();
  });

  it("exibe valor negativo do filteredProfit sem prefixo '+'", () => {
    mockViewModel.mockReturnValue(
      baseProps({ hasActiveFilter: true, filteredProfit: -15.75 }),
    );

    render(<TournamentsView />);

    expect(screen.getByText(/-15\.75/)).toBeInTheDocument();
  });
});

describe("TournamentsView — paginação", () => {
  it("não exibe paginação quando totalPages é 1", () => {
    render(<TournamentsView />);

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("exibe paginação quando totalPages > 1", () => {
    mockViewModel.mockReturnValue(
      baseProps({ totalPages: 3, paginationPages: [1, 2, 3] }),
    );

    render(<TournamentsView />);

    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("exibe links de página numéricos na paginação", () => {
    mockViewModel.mockReturnValue(
      baseProps({ totalPages: 3, currentPage: 1, paginationPages: [1, 2, 3] }),
    );

    render(<TournamentsView />);

    expect(screen.getByRole("link", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "3" })).toBeInTheDocument();
  });

  it("clique em link de página chama onPageChange com o número correto", async () => {
    const onPageChange = jest.fn();
    mockViewModel.mockReturnValue(
      baseProps({ totalPages: 3, currentPage: 1, paginationPages: [1, 2, 3], onPageChange }),
    );

    render(<TournamentsView />);

    await userEvent.click(screen.getByRole("link", { name: "2" }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

describe("TournamentsView — botão importar grade", () => {
  it("botão 'Adicionar grade' chama onOpenImportScheduleModal", async () => {
    const onOpenImportScheduleModal = jest.fn();
    mockViewModel.mockReturnValue(baseProps({ onOpenImportScheduleModal }));

    render(<TournamentsView />);

    await userEvent.click(screen.getByRole("button", { name: /adicionar grade/i }));

    expect(onOpenImportScheduleModal).toHaveBeenCalled();
  });
});
