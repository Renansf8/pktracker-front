# Regras de ABI e Progressão de Stakes

Documenta as fórmulas e decisões por trás dos cálculos de gestão de banca no pktracker.

---

## Conceitos

### ABI (Average Buy-In)
Valor médio que você pode gastar por torneio dada sua banca atual e a regra de buy-ins configurada.

```
ABI = banca / nº de buy-ins
```

Exemplo: banca de $1.914,95 com regra de 300 buy-ins → ABI = $6,38

### Regra de buy-ins
Define o número de buy-ins que sua banca deve suportar. Quanto maior o número, mais conservadora é a gestão.

| Modo | Fórmula | Quando usar |
|---|---|---|
| Padrão (100–150) | ABI mínimo = banca/150; ABI máximo = banca/100 | Sem customização, retorna uma faixa |
| Customizado | ABI fixo = banca/N | Usuário define N no input da home |

O valor customizado é salvo em `localStorage` com a chave `pktracker:abi-buy-ins` e compartilhado entre a home e a página de carreira.

---

## Stakes padrão

Lista fixa de buy-ins comuns em MTTs online (USD), em ordem crescente:

```
[1, 2, 2.2, 3.3, 5.5, 8.8, 11, 16.5, 22, 33, 55, 109]
```

Todos os cálculos de nível usam essa lista como referência.

---

## Nível atual (low stake)

O nível primário é o maior stake da lista padrão que cabe dentro do ABI com uma tolerância de 2%:

```
low = maior stake onde: stake ≤ ABI × 1.02
```

A tolerância de 2% evita que um ABI de $5,49 fique "preso" no nível $3,30 quando $5,50 já é praticamente alcançável.

**Exemplo:** ABI = $6,38 → $5,50 ≤ $6,38 × 1,02 = $6,51 → **nível = $5,50**

---

## Stake intercalado (high stake)

O stake intercalado é uma faixa mais alta que você pode jogar ocasionalmente (não como foco principal). A fórmula calcula um "alvo esticado" com base no ABI:

```
targetHigh = min(ABI × 1.85, ABI × 2.1)   [com ABI range: usa min e max da faixa]
high = primeiro stake ≥ targetHigh × 0.88
```

O fator `× 0.88` cria uma folga para baixo, evitando que o stake intercalado fique sempre no nível logo acima.

**Exemplo:** ABI = $6,38
- targetHigh = min($6,38 × 1,85, $6,38 × 2,1) = min($11,80, $13,40) = $11,80
- high = primeiro stake ≥ $11,80 × 0,88 = $10,38 → **$11,00**

Resultado final da home e carreira: *"Torneios de $5,50 e alguns de $11,00 intercalados."*

---

## Próximo nível primário

O progresso da barra de carreira aponta para quando o **nível primário** (low) sobe. Isso ocorre quando sua banca for suficiente para que o próximo stake da lista passe pelo critério de `low`:

```
bankNeededForNextLow = próximo_stake_após_low × nº_buy-ins
progressão = banca_atual / bankNeededForNextLow × 100%
```

**Exemplo:** nível atual = $5,50, próximo = $8,80, regra 300 buy-ins
- bankNeeded = $8,80 × 300 = **$2.640**
- progresso = $1.914,95 / $2.640 = **72,5%**

---

## Fluxo completo (com 300 buy-ins e banca $1.914,95)

```
ABI = 1914.95 / 300 = 6.38

low  = maior stake ≤ 6.38 × 1.02 (= 6.51) → 5.50  ← nível atual
high = primeiro stake ≥ min(6.38×1.85, 6.38×2.1) × 0.88
     = primeiro stake ≥ 11.80 × 0.88 (= 10.38)    → 11.00 ← intercalado

nextLow       = 8.80   (próximo após 5.50 na lista)
bankNeeded    = 8.80 × 300 = 2.640
progressão    = 1914.95 / 2640 = 72.5%
```

---

## Onde cada lógica vive no código

| Cálculo | Arquivo |
|---|---|
| ABI range padrão (100–150) | `src/utils/abiSuggestion.ts` → `getAbiSuggestedRange` |
| ABI customizado | `src/utils/abiSuggestion.ts` → `getAbiForCustomBuyIns` |
| low + high stakes | `src/utils/abiSuggestion.ts` → `getSuggestedStakeLevels` |
| Progressão de stakes (career) | `src/app/(protected)/career/career.viewmodel.ts` → `computeStakesProgression` |
| Card de sugestão (home) | `src/components/PlayerSuggestions.tsx` → `AbiSuggestionCard` |

A home e a página de carreira usam a **mesma função** `getSuggestedStakeLevels`, garantindo resultados consistentes.
