# CoBudget Decision Engine - Fluxo Canônico, Regras e Demo

Este documento oficializa o fluxo principal do produto e as regras de governança de cenário/decisão para evitar regressões.

## 1) Fluxo canônico (obrigatório)

`Planning Budget -> New Scenario -> Scenario Result -> Create Decision -> Decisions`

Regras:
- O CTA principal em Budget deve ir para `/planning/scenarios/new`.
- `/planning/scenarios` é hub neutro (listagem/browse), não passo obrigatório do onboarding.
- A criação de decisão é primária na tela de resultado de cenário.

## 2) Contratos de rota (fonte de verdade)

- `GET /planning/budget` (`planning-budget`): origem do onboarding financeiro.
- `GET /planning/scenarios/new` (`planning-scenarios-new`): criação de novo cenário.
- `GET /planning/scenarios/:id` (`planning-scenarios-result`): resultado de cenário salvo.
- `GET /planning/scenarios/:id/edit` (`planning-scenarios-edit`): edição de cenário (somente quando permitido).
- `GET /planning/scenarios` (`planning-scenarios`): hub/lista de cenários.
- `GET /decisions` (`decisions`): lista de decisões.
- `GET /decision/:id` (`decision-detail`): detalhe de decisão (deep-link de notificação).

Não enviar contexto para destinos que não consomem esse contexto.

## 3) Regras críticas de estado e persistência

### 3.1 Salvar antes de criar decisão
- "Save and create decision" deve executar:
  1) persistir cenário atualizado;
  2) criar decisão com `scenarioId` persistido.
- Nunca criar decisão com snapshot stale.

### 3.2 Resultado salvo é determinístico
- Ao abrir cenário salvo, exibir snapshot persistido por padrão.
- Recalcular apenas por ação explícita do usuário (`Recalculate`).

### 3.3 `/planning/scenarios/new` é novo cenário
- Não reutilizar cenário atual implicitamente.
- Reuso só é permitido quando explícito (`cloneFrom`/`resume`).

## 4) Governança de cenário após votos (imutabilidade)

Se a decisão vinculada ao cenário já tiver pelo menos 1 voto:
- o cenário não pode ser editado "in place";
- a ação de edição vira **Create new version**;
- a navegação deve abrir `/planning/scenarios/new?cloneFrom=:id&locked=1`;
- o novo fluxo deve salvar com novo `scenarioId`.

Objetivo: preservar histórico de votação e consistência de auditoria.

Referência arquitetural: `docs/adr/ADR-005-scenario-versioning-after-decision-votes.md`.

## 5) Roteiro E2E de validação (QA)

### 5.1 Onboarding primário
1. Acesse `Planning > Budget`.
2. Crie/ative budget.
3. Clique `Create Scenario`.
4. Confirme rota: `/planning/scenarios/new`.

### 5.2 Cenário e resultado
1. Preencha template e ajustes.
2. Clique `Simulate scenario`.
3. Confirme resultado em `/planning/scenarios/preview` (ou `:id` após salvar).
4. Clique `Save scenario`.

### 5.3 Decisão
1. Na tela de resultado, clique `Create decision` (ou `Save and create decision`).
2. Confirme redirecionamento para `/decisions`.
3. Confirme novo card de decisão.

### 5.4 Imutabilidade após votos
1. Registre ao menos 1 voto na decisão.
2. Volte ao resultado do cenário original.
3. Confirme ação `Create new version` (não `Edit`).
4. Confirme que editar redireciona para `/planning/scenarios/new?cloneFrom=:id&locked=1`.
5. Salve nova versão e crie nova decisão.

## 6) Roteiro comercial (15 min)

1. Budget: mostrar plano base e CTA direto para criação de cenário.
2. New Scenario: template + poucos ajustes (sem jargão técnico).
3. Scenario Result: impacto e recomendação.
4. Create Decision: transformar simulação em decisão colaborativa.
5. Decisions: votos/comentários e governança de versões após voto.
6. Dashboard/Insights (opcional): evidência de valor downstream.

## 7) Anti-regressão (checklist de release)

- [ ] Budget CTA principal aponta para `/planning/scenarios/new`.
- [ ] Nenhuma navegação envia query ignorada para `/planning/scenarios`.
- [ ] Notificação abre decisão via rota de detalhe.
- [ ] Cenário salvo abre resultado estável (sem re-simulação silenciosa).
- [ ] Save-and-create persiste cenário antes da decisão.
- [ ] Cenário com decisão votada não permite edição in-place.
- [ ] Fluxo principal é executável sem passar pelo hub de cenários.

## 8) TODO de produto (expurgo futuro)

- TODO: especificar metodologia de observação para expurgo de decisões/cenários sem perder governança.
- Métricas mínimas para ativar política:
  - volume por status (`OPEN`, `APPROVED`, `REJECTED`);
  - idade média por status;
  - decisões sem atividade (voto/comentário/status) por janela de tempo;
  - impacto de storage por workspace.
- Regra sugerida inicial: somente arquivamento/soft-delete primeiro; purge definitivo apenas após período de retenção e trilha de auditoria validada.
