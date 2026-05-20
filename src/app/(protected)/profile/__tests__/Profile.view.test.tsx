import { render, screen } from "@testing-library/react";
import { ProfileView } from "../Profile.view";
import { useProfileViewModel } from "../profile.viewmodel";
import type { ProfileViewProps } from "../profile.types";

jest.mock("../profile.viewmodel");
const mockViewModel = useProfileViewModel as jest.MockedFunction<typeof useProfileViewModel>;

function baseProps(overrides: Partial<ProfileViewProps> = {}): ProfileViewProps {
  return {
    isLoading: false,
    name: "João Silva",
    email: "joao@example.com",
    bankBalance: 500,
    totalDeposit: 600,
    totalWithdrawal: 100,
    profit: 50,
    ...overrides,
  };
}

beforeEach(() => {
  mockViewModel.mockReturnValue(baseProps());
});

describe("ProfileView — loading", () => {
  it("não exibe conteúdo do perfil enquanto carrega", () => {
    mockViewModel.mockReturnValue(baseProps({ isLoading: true }));

    render(<ProfileView />);

    expect(screen.queryByText("Perfil")).not.toBeInTheDocument();
  });

  it("exibe conteúdo quando não está carregando", () => {
    render(<ProfileView />);

    expect(screen.getByText("Perfil")).toBeInTheDocument();
  });
});

describe("ProfileView — dados do usuário", () => {
  it("exibe o nome do usuário", () => {
    render(<ProfileView />);

    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });

  it("exibe o email do usuário", () => {
    render(<ProfileView />);

    expect(screen.getByText("joao@example.com")).toBeInTheDocument();
  });

  it("exibe '—' quando name está vazio", () => {
    mockViewModel.mockReturnValue(baseProps({ name: "" }));

    render(<ProfileView />);

    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
  });

  it("exibe '—' quando email está vazio", () => {
    mockViewModel.mockReturnValue(baseProps({ email: "" }));

    render(<ProfileView />);

    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
  });
});

describe("ProfileView — dados bancários", () => {
  it("exibe o saldo da banca formatado", () => {
    mockViewModel.mockReturnValue(baseProps({ bankBalance: 1250.5 }));

    render(<ProfileView />);

    expect(screen.getByText("$ 1250.50")).toBeInTheDocument();
  });

  it("exibe total depositado", () => {
    mockViewModel.mockReturnValue(baseProps({ totalDeposit: 800 }));

    render(<ProfileView />);

    expect(screen.getByText(/total depositado:.*\$ 800\.00/i)).toBeInTheDocument();
  });

  it("exibe total sacado", () => {
    mockViewModel.mockReturnValue(baseProps({ totalWithdrawal: 150 }));

    render(<ProfileView />);

    expect(screen.getByText(/total sacado:.*\$ 150\.00/i)).toBeInTheDocument();
  });

  it("exibe o lucro formatado", () => {
    mockViewModel.mockReturnValue(baseProps({ profit: 75 }));

    render(<ProfileView />);

    expect(screen.getByText(/lucro:.*\$ 75\.00/i)).toBeInTheDocument();
  });

  it("lucro positivo exibe classe de texto verde", () => {
    mockViewModel.mockReturnValue(baseProps({ profit: 100 }));

    render(<ProfileView />);

    const profitEl = screen.getByText(/lucro:/i);
    expect(profitEl.className).toMatch(/green/);
  });

  it("lucro negativo exibe classe de texto vermelho", () => {
    mockViewModel.mockReturnValue(baseProps({ profit: -50 }));

    render(<ProfileView />);

    const profitEl = screen.getByText(/lucro:/i);
    expect(profitEl.className).toMatch(/red/);
  });

  it("exibe label 'Banca'", () => {
    render(<ProfileView />);

    expect(screen.getByText("Banca")).toBeInTheDocument();
  });
});
