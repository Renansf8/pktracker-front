/**
 * src/app/(auth)/layout.tsx
 * ---------------------------------------------------------------------------
 * Layout compartilhado pelas rotas de autenticação (/signin, /signup).
 *
 * A pasta `(auth)` é um ROUTE GROUP: os parênteses fazem o Next NÃO
 * incluir esse segmento na URL final. Ou seja:
 *   - Pasta:   src/app/(auth)/signin/page.tsx
 *   - URL:     /signin  (sem o "auth")
 *
 * Isso permite agrupar rotas que compartilham layout sem criar um prefixo.
 *
 * Aqui não renderizamos NavBar — a tela de login é minimalista. O middleware
 * já garantiu que só usuários NÃO logados chegam aqui; se um usuário logado
 * acessar /signin ele é redirecionado para / antes de bater neste layout.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      {children}
    </main>
  );
}
