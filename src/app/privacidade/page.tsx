import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — PkTracker",
};

const CONTROLLER_NAME = "Renan Santiago";
const CONTACT_EMAIL = "renansferreira8@gmail.com";
const LAST_UPDATED = "07/11/2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-semibold text-text-primary">{title}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-text-secondary">{children}</div>
    </section>
  );
}

// Public page (see PUBLIC_ROUTES in middleware.ts): readable logged in or out.
// Keep it in sync with what the app actually collects and who it shares with.
export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex w-[90%] max-w-3xl flex-col gap-10 py-12">
      <header className="flex flex-col gap-2 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <p
          className="text-[10px] uppercase tracking-[0.18em] font-medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          PkTracker
        </p>
        <h1 className="font-display text-3xl font-bold text-text-primary">Política de Privacidade</h1>
        <p className="text-sm text-text-secondary">Última atualização: {LAST_UPDATED}</p>
      </header>

      <Section title="1. Quem é o responsável pelos seus dados">
        <p>
          O PkTracker é mantido por {CONTROLLER_NAME}, responsável (controlador) pelo tratamento dos
          dados pessoais descritos aqui, nos termos da Lei Geral de Proteção de Dados (Lei nº
          13.709/2018, LGPD). Para qualquer assunto sobre privacidade, escreva para{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-text-primary underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <Section title="2. Quais dados coletamos">
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>
            <strong className="text-text-primary">Dados da conta:</strong> nome e e-mail. A senha é
            guardada apenas como hash criptográfico; ninguém consegue lê-la.
          </li>
          <li>
            <strong className="text-text-primary">Dados que você registra:</strong> torneios (nome,
            plataforma, data, moeda, buy-in, prêmio, posição e resultado), movimentações da banca
            (depósitos, saques e rake) e grades de torneios.
          </li>
          <li>
            <strong className="text-text-primary">Pedidos na página Insights:</strong> o texto que você
            escreve para gerar um dashboard e, se você pedir um comentário, os valores calculados
            para esse dashboard.
          </li>
          <li>
            <strong className="text-text-primary">Dados técnicos:</strong> o cookie de sessão que
            mantém você logado e registros de erros do site, descritos nas seções 5 e 6.
          </li>
        </ul>
        <p>Não coletamos documentos, dados de pagamento nem dados de localização.</p>
      </Section>

      <Section title="3. Para que usamos e com qual base legal">
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>
            Criar e manter sua conta, guardar seus resultados e calcular suas estatísticas: execução
            do serviço que você solicitou (art. 7º, V, da LGPD).
          </li>
          <li>
            Enviar o e-mail de recuperação de senha quando você o solicita: execução do serviço (art.
            7º, V).
          </li>
          <li>
            Proteger a conta contra acessos indevidos (por exemplo, limitando tentativas de login) e
            corrigir erros do site: legítimo interesse (art. 7º, IX).
          </li>
        </ul>
        <p>Seus dados não são vendidos, não são usados para publicidade e não são compartilhados para marketing.</p>
      </Section>

      <Section title="4. Com quem compartilhamos">
        <p>
          Para funcionar, o PkTracker usa os serviços abaixo, que tratam dados apenas para prestar
          esse serviço ao PkTracker:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>
            <strong className="text-text-primary">Supabase:</strong> banco de dados onde ficam sua conta
            e seus registros (servidores nos Estados Unidos).
          </li>
          <li>
            <strong className="text-text-primary">Render:</strong> hospedagem do servidor da aplicação.
          </li>
          <li>
            <strong className="text-text-primary">Resend:</strong> envio do e-mail de recuperação de
            senha (recebe seu e-mail e o link de recuperação).
          </li>
          <li>
            <strong className="text-text-primary">Sentry:</strong> monitoramento de erros do site
            (detalhes na seção 6).
          </li>
          <li>
            <strong className="text-text-primary">Anthropic:</strong> só quando você usa a página
            Insights. Para montar o dashboard, recebe o texto do seu pedido e um resumo da sua conta
            (quantidade de torneios, datas do primeiro e do último, plataformas e moedas que você
            usa). Os números do dashboard são calculados pelo próprio PkTracker. Se você clicar em
            &quot;Comentar resultados&quot;, a Anthropic também recebe os valores calculados para esse
            dashboard (como lucro, ROI, buy-ins, prêmios, posições, datas, variações e quedas), os
            nomes de torneios e plataformas que aparecem nele, as moedas da sua conta e o texto do seu
            pedido, para escrever o comentário. Seu nome e e-mail nunca são enviados.
          </li>
        </ul>
        <p>
          Alguns desses serviços ficam fora do Brasil, o que caracteriza transferência internacional
          de dados (art. 33 da LGPD), feita apenas para a execução do serviço.
        </p>
      </Section>

      <Section title="5. Cookies">
        <p>
          Usamos um único cookie, <code className="text-text-primary">auth_token</code>, que mantém
          você logado por até 7 dias. Ele é essencial para o funcionamento do site, não pode ser lido
          por scripts da página e não é usado para rastreamento. Não usamos cookies de publicidade ou
          de análise de terceiros.
        </p>
      </Section>

      <Section title="6. Registros de erros">
        <p>
          Quando ocorre um erro, o Sentry recebe informações técnicas para que ele possa ser
          corrigido, e pode gravar uma reprodução da sessão. Essa gravação mostra apenas a estrutura da
          página: todos os textos, campos e imagens são mascarados, então seus valores, e-mail e
          resultados não aparecem. O monitoramento está configurado para não enviar dados pessoais
          identificáveis.
        </p>
      </Section>

      <Section title="7. Por quanto tempo guardamos">
        <p>
          Seus dados ficam guardados enquanto sua conta existir. Se você pedir a exclusão da conta,
          seus dados são apagados, salvo o que a lei exigir manter.
        </p>
      </Section>

      <Section title="8. Seus direitos">
        <p>
          Pela LGPD (art. 18), você pode pedir a qualquer momento: confirmação de que tratamos seus
          dados, acesso a eles, correção, exclusão, portabilidade, informação sobre com quem são
          compartilhados e revisão desta política. Basta escrever para{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-text-primary underline">
            {CONTACT_EMAIL}
          </a>
          ; respondemos em até 15 dias. Você também pode reclamar à Autoridade Nacional de Proteção de
          Dados (ANPD).
        </p>
      </Section>

      <Section title="9. Segurança">
        <p>
          Todo o tráfego usa HTTPS, senhas são guardadas com hash, cada usuário só acessa os próprios
          dados e as tentativas de login são limitadas. Nenhum sistema é totalmente imune a falhas; se
          ocorrer um incidente que afete seus dados, você será avisado.
        </p>
      </Section>

      <Section title="10. Alterações">
        <p>
          Esta política pode mudar quando o PkTracker mudar. A data no topo indica a última
          atualização; mudanças importantes serão avisadas no próprio site.
        </p>
      </Section>

      <footer className="pt-6 text-sm" style={{ borderTop: "1px solid var(--border)" }}>
        <Link href="/" className="text-text-secondary underline">
          Voltar ao PkTracker
        </Link>
      </footer>
    </main>
  );
}
