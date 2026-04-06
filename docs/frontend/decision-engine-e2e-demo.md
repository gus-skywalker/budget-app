# CoBudget Decision Engine - Roteiro de Teste e Demo Comercial

Este documento valida e demonstra o fluxo completo do produto:

`Budget -> Scenario -> Decision -> Apply -> Dashboard`

## 1. Objetivo

Provar que o CoBudget deixou de ser apenas simulação e passou a executar decisões no planejamento:

1. Criar plano base (Budget).
2. Simular mudanças (Scenario).
3. Converter em decisão colaborativa (Decision).
4. Aplicar decisão (Apply).
5. Ver impacto refletido no Dashboard.

## 2. Pré-requisitos

1. Backend `budget-api` rodando em `http://localhost:8080`.
2. Frontend `budget-app` rodando em `http://localhost:5173` (ou porta configurada).
3. Usuário autenticado com workspace ativo.
4. Mês atual sem bloqueios de orçamento ativo.

## 3. Dataset mínimo sugerido para demo

Use estes valores para uma narrativa clara:

1. Budget ativo do mês atual:
   - Revenue (INCOME): `R$ 20.000`
   - Operations (EXPENSE): `R$ 8.000`
   - Marketing (EXPENSE): `R$ 4.000`
2. Resultado esperado do baseline:
   - Total Income: `R$ 20.000`
   - Total Expense: `R$ 12.000`
   - Net: `R$ 8.000`

## 4. Roteiro técnico (E2E funcional)

## 4.1 Budget (Baseline)

1. Acesse `Planning > Budget`.
2. Se não houver orçamento ativo, clique no CTA de criação de budget mínimo.
3. Adicione linhas de budget conforme dataset.
4. Ative o budget (se necessário).
5. Valide o card resumo:
   - `totalIncome`
   - `totalExpense`
   - `net`
6. Clique em `Simulate Scenario`.

Critério de aceite:
1. Existe um budget `ACTIVE` no período.
2. Totais calculados corretamente.

## 4.2 Scenario (Derivado do Budget)

1. Em `Planning > Scenarios`, valide se baseline foi carregado.
2. Se não houver cenário, valide auto-criação a partir do budget.
3. Na tabela `Budget baseline lines`:
   - altere `Marketing` de `R$ 4.000` para `R$ 6.500`
   - altere `Revenue` de `R$ 20.000` para `R$ 21.000`
4. Verifique `delta` por linha:
   - Marketing: `+R$ 2.500` (despesa)
   - Revenue: `+R$ 1.000` (receita)
5. Opcional: clique em `Add change` e adicione um ajuste mensal extra.
6. Salve/simule cenário e clique `Create Decision from Scenario`.

Critério de aceite:
1. `originalAmount`, `adjustedAmount` e `delta` visíveis.
2. Cenário vinculado ao budget (não manual solto).

## 4.3 Decision (Colaboração e ação)

1. Acesse `Decisions`.
2. Encontre a decisão criada a partir do cenário.
3. Valide que o status inicial é `OPEN`.
4. (Opcional) adicione comentário e voto para mostrar colaboração.
5. Clique `Apply Decision`.

Critério de aceite:
1. A decisão muda para `APPROVED`.
2. A decisão passa a ter `appliedAt`.
3. Não é possível aplicar novamente (esperado conflito).

## 4.4 Apply (Mudança real no Budget)

1. Após aplicar, volte para `Planning > Budget`.
2. Valide que as linhas impactadas foram atualizadas com os `adjustedAmount` do cenário.
3. Confira os novos totais:
   - Novo Income: `R$ 21.000`
   - Novo Expense: `R$ 14.500`
   - Novo Net: `R$ 6.500`

Critério de aceite:
1. Budget ativo foi atualizado.
2. Não houve alteração em ledger/transações.

## 4.5 Dashboard (Reflexo do impacto)

1. Acesse `Dashboard`.
2. Vá até `Impact of Decisions`.
3. Valide:
   - apenas decisões `APPROVED` aparecem
   - impacto agregado condiz com cenário aplicado
4. Mensagem esperada no estilo:
   - `Approved decisions reduced net by R$ X this month`
   - ou `increased` quando impacto for positivo.

Critério de aceite:
1. Dashboard reflete decisões aprovadas.
2. Impacto agregado consistente.

## 5. Roteiro comercial (15 minutos)

## 5.1 Narrativa

1. "Este é o plano atual do time" (Budget).
2. "E se aumentarmos marketing?" (Scenario).
3. "Qual o impacto financeiro?" (delta e net).
4. "Vamos decidir em equipe" (Decision com comentários/votos).
5. "Agora executamos de fato" (Apply).
6. "E acompanhamos resultado consolidado" (Dashboard).

## 5.2 Script sugerido por tempo

1. Min 0-3: abrir Budget e mostrar baseline.
2. Min 3-7: editar cenário e mostrar delta.
3. Min 7-10: criar decisão e colaboração rápida.
4. Min 10-12: `Apply Decision`.
5. Min 12-15: Dashboard com impacto aprovado.

## 6. Checklist de aceite final (Go/No-Go)

Marque `OK` em todos:

1. Budget ativo criado e visível.
2. Scenario deriva do budget (com baseline lines).
3. Decision criada a partir de scenario.
4. `Apply Decision` aprova e grava `appliedAt`.
5. Budget atualizado com valores ajustados.
6. Dashboard mostra impacto somente de decisões aprovadas.
7. Reaplicar a mesma decisão falha corretamente.

## 7. Troubleshooting rápido

## 7.1 Erro 500 ao criar budget

1. Verifique se migrations do `budget-api` foram aplicadas.
2. Confirme colunas legadas compatibilizadas na tabela `budgets`.

## 7.2 Cenário sem baseline

1. Confirme existência de budget `ACTIVE` no mês/ano atual.
2. Reabra a view de scenarios para acionar auto-load.

## 7.3 Apply falha com conflito

1. Verifique status da decisão.
2. Apenas `OPEN` pode ser aplicada.
3. Se já está `APPROVED`, comportamento é esperado.

## 7.4 Dashboard sem impacto atualizado

1. Recarregue `Dashboard`.
2. Confirme que decisão está `APPROVED`.
3. Confirme vínculo correto entre decision e scenario.

## 8. Evidências recomendadas para venda

Capture 5 screenshots:

1. Budget com resumo (baseline).
2. Scenario com deltas destacados.
3. Decision `OPEN` com contexto.
4. Decision após `Apply` (`APPROVED` + `appliedAt`).
5. Dashboard com `Impact of Decisions`.

Com isso, a demo mostra claramente o valor do produto:
planejar, simular, decidir, executar e acompanhar.
