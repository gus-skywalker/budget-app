# ADR-005: Bloquear edição de cenário após votos e criar nova versão

## Status
Accepted (2026-04-18)

## Contexto
O fluxo de planejamento e decisão evoluiu para colaboração real (`vote approve/reject`) sobre decisões derivadas de cenário.
Quando um cenário já possui decisão com votos, permitir edição do mesmo `scenarioId` quebra:

- rastreabilidade (o que foi votado deixa de ser estável);
- consistência de auditoria (voto passa a apontar para conteúdo mutável);
- previsibilidade do produto para demo e operação.

## Decisão
Após existir pelo menos 1 voto em decisão vinculada ao cenário, o cenário torna-se **imutável para edição direta**.

Regras:

1. Botão de edição na tela de resultado passa a representar **Create new version**.
2. Tentativa de entrar em `/planning/scenarios/:id/edit` para cenário bloqueado redireciona para:
   - `/planning/scenarios/new?cloneFrom=:id&locked=1`
3. O wizard em `/planning/scenarios/new` com `cloneFrom`:
   - carrega os ajustes do cenário de origem;
   - força `currentScenarioId = null` para persistir como novo cenário;
   - mantém histórico do cenário original intacto.

## Consequências

### Positivas
- Preserva trilha de decisão/votação.
- Evita regressão de estado entre cenário e decisão.
- Reforça narrativa comercial: "mudança depois de votos = nova versão + nova decisão".

### Trade-offs
- Usuário precisa criar nova versão em vez de "editar em lugar".
- Pode haver crescimento de cenários similares (esperado; governável por UX/listagem).

## Notas de implementação
- A regra é aplicada no frontend por governança de fluxo e UX.
- Não há alteração de contrato de API para cumprir essa decisão.

## TODO (governança de ciclo de vida)
- Definir política formal de retenção/expurgo para decisões e cenários vinculados (com observabilidade).
- Proposta mínima para próxima iteração:
  1. estados elegíveis para arquivamento (ex.: `REJECTED` sem atividade por N dias);
  2. período de retenção por workspace/tier;
  3. trilha de auditoria obrigatória antes de expurgo;
  4. dry-run com métricas (quantidade, impacto, taxa de restauração);
  5. janela de restauração (soft-delete) antes de purge definitivo.
