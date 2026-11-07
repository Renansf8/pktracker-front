import { render, screen } from "@testing-library/react";
import PrivacyPolicyPage from "../page";

describe("PrivacyPolicyPage", () => {
  it("names the controller and a contact email", () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByText(/mantido por Renan Santiago/)).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: "renansferreira8@gmail.com" });
    expect(links[0]).toHaveAttribute("href", "mailto:renansferreira8@gmail.com");
  });

  it("lists every third party that receives data", () => {
    render(<PrivacyPolicyPage />);
    for (const provider of ["Supabase:", "Render:", "Resend:", "Sentry:", "Anthropic:"]) {
      expect(screen.getByText(provider)).toBeInTheDocument();
    }
  });

  it("covers cookies and the data subject rights", () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByRole("heading", { name: "5. Cookies" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "8. Seus direitos" })).toBeInTheDocument();
  });

  it("discloses that commenting on results sends the dashboard values to Anthropic", () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByText(/Comentar resultados/)).toBeInTheDocument();
    expect(screen.getByText(/nomes de torneios e plataformas que aparecem nele/)).toBeInTheDocument();
    expect(screen.getByText(/as moedas da sua conta e o texto do seu pedido/)).toBeInTheDocument();
    expect(screen.getByText(/Seu nome e e-mail nunca são enviados/)).toBeInTheDocument();
  });
});
