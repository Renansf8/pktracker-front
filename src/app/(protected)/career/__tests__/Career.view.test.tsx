import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CareerView } from "../Career.view";
import { useCareerViewModel } from "../career.viewmodel";
import type { CareerViewProps } from "../career.types";

jest.mock("../career.viewmodel");
const mockViewModel = useCareerViewModel as jest.MockedFunction<typeof useCareerViewModel>;

function baseProps(overrides: Partial<CareerViewProps> = {}): CareerViewProps {
  return {
    isLoading: false,
    totalTournaments: 0,
    stakesProgression: null,
    milestones: [],
    stakingDeals: [],
    newDealState: { backerName: "", myPct: "", markup: "", notes: "" },
    onNewDealChange: jest.fn(),
    onAddStakingDeal: jest.fn(),
    onRemoveStakingDeal: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mockViewModel.mockReturnValue(baseProps());
});

describe("CareerView — loading", () => {
  it("exibe 'Carregando carreira…' quando isLoading é true", () => {
    mockViewModel.mockReturnValue(baseProps({ isLoading: true }));

    render(<CareerView />);

    expect(screen.getByText(/carregando carreira/i)).toBeInTheDocument();
  });

  it("não exibe loading quando dados disponíveis", () => {
    render(<CareerView />);

    expect(screen.queryByText(/carregando carreira/i)).not.toBeInTheDocument();
  });
});

describe("CareerView — cabeçalho", () => {
  it("exibe título 'Progressão'", () => {
    render(<CareerView />);

    expect(screen.getByRole("heading", { name: /progressão/i })).toBeInTheDocument();
  });

  it("exibe total de torneios no cabeçalho", () => {
    mockViewModel.mockReturnValue(baseProps({ totalTournaments: 42 }));

    render(<CareerView />);

    expect(screen.getByText(/42 torneios/i)).toBeInTheDocument();
  });

  it("exibe '0 torneios' quando não há torneios", () => {
    render(<CareerView />);

    expect(screen.getByText(/0 torneios/i)).toBeInTheDocument();
  });
});

describe("CareerView — seção 01 (Progressão de stakes)", () => {
  it("não exibe seção de stakes quando stakesProgression é null", () => {
    render(<CareerView />);

    expect(screen.queryByText(/progressão de stakes/i)).not.toBeInTheDocument();
  });

  it("exibe seção de stakes quando stakesProgression não é null", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        stakesProgression: {
          lowStake: 11,
          highStake: 22,
          nextLowStake: 16.5,
          bankNeededForNextLow: 1650,
          progressToNextLow: 66.7,
          bankUsd: 1100,
          rangeMin: 7.33,
          rangeMax: 11,
          customBuyIns: null,
        },
      }),
    );

    render(<CareerView />);

    expect(screen.getByText(/progressão de stakes/i)).toBeInTheDocument();
  });

  it("exibe banca atual quando stakesProgression está definida", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        stakesProgression: {
          lowStake: 11,
          highStake: null,
          nextLowStake: null,
          bankNeededForNextLow: null,
          progressToNextLow: 100,
          bankUsd: 1100,
          rangeMin: 7.33,
          rangeMax: 11,
          customBuyIns: null,
        },
      }),
    );

    render(<CareerView />);

    expect(screen.getByText(/banca atual/i)).toBeInTheDocument();
  });
});

describe("CareerView — seção 02 (Marcos da carreira)", () => {
  it("não exibe seção de marcos quando milestones está vazio", () => {
    render(<CareerView />);

    expect(screen.queryByText(/marcos da carreira/i)).not.toBeInTheDocument();
  });

  it("exibe seção de marcos quando há milestones", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        milestones: [
          {
            id: "first",
            label: "Primeiro torneio",
            sublabel: "Sunday Millions",
            date: "2026-01-15",
            icon: "◆",
          },
        ],
      }),
    );

    render(<CareerView />);

    expect(screen.getByText(/marcos da carreira/i)).toBeInTheDocument();
    expect(screen.getByText("Primeiro torneio")).toBeInTheDocument();
    expect(screen.getByText("Sunday Millions")).toBeInTheDocument();
  });

  it("exibe valor monetário quando milestone tem value", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        milestones: [
          {
            id: "biggest_win",
            label: "Maior vitória",
            sublabel: "Big Event",
            date: "2026-03-10",
            value: 500,
            icon: "◈",
          },
        ],
      }),
    );

    render(<CareerView />);

    expect(screen.getByText(/\$ 500\.00/)).toBeInTheDocument();
  });
});

describe("CareerView — seção 03 (Staking)", () => {
  it("exibe seção de staking sempre", () => {
    render(<CareerView />);

    expect(screen.getByText(/^staking$/i)).toBeInTheDocument();
  });

  it("exibe formulário de novo acordo", () => {
    render(<CareerView />);

    expect(screen.getByText(/novo acordo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nome do backer/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /adicionar/i })).toBeInTheDocument();
  });

  it("exibe deal existente com nome do backer e percentual", () => {
    mockViewModel.mockReturnValue(
      baseProps({
        stakingDeals: [
          {
            id: "d1",
            backerName: "Fulano",
            myPct: 60,
            markup: 1.05,
            notes: "",
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      }),
    );

    render(<CareerView />);

    expect(screen.getByText("Fulano")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("chama onRemoveStakingDeal ao clicar em remover", async () => {
    const onRemoveStakingDeal = jest.fn();
    mockViewModel.mockReturnValue(
      baseProps({
        stakingDeals: [
          {
            id: "d1",
            backerName: "Fulano",
            myPct: 60,
            markup: 1,
            notes: "",
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
        onRemoveStakingDeal,
      }),
    );

    render(<CareerView />);
    await userEvent.click(screen.getByRole("button", { name: /remover/i }));

    expect(onRemoveStakingDeal).toHaveBeenCalledWith("d1");
  });

  it("chama onAddStakingDeal ao clicar em Adicionar", async () => {
    const onAddStakingDeal = jest.fn();
    mockViewModel.mockReturnValue(baseProps({ onAddStakingDeal }));

    render(<CareerView />);
    await userEvent.click(screen.getByRole("button", { name: /adicionar/i }));

    expect(onAddStakingDeal).toHaveBeenCalledTimes(1);
  });

  it("chama onNewDealChange ao digitar no campo de backer", async () => {
    const onNewDealChange = jest.fn();
    mockViewModel.mockReturnValue(baseProps({ onNewDealChange }));

    render(<CareerView />);
    await userEvent.type(screen.getByPlaceholderText(/nome do backer/i), "A");

    expect(onNewDealChange).toHaveBeenCalledWith("backerName", expect.any(String));
  });
});
