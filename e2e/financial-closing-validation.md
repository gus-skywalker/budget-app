# Validação ponta a ponta — Apuração de Resultados

Este roteiro é o artefato de aceitação antes da rodada funcional manual. Ele
deve ser executado somente contra o ambiente local e dados sintéticos. Cada
linha deve terminar como **PASSOU**, **GAP UI**, **GAP CÓDIGO** ou **BLOQUEADO**,
com screenshot, vídeo ou trace anexado.

## Ambiente e evidências

- Frontend: `http://127.0.0.1:5173`
- BFF público: `http://127.0.0.1:8080/api`
- Serviço de fechamento: `http://127.0.0.1:8081` — nunca aberto pelo browser.
- Use apenas workspaces e usuários sintéticos locais.
- Nunca use planilhas, PDFs ou identificadores reais.
- Em qualquer falha, registre URL, mensagem visível, ação executada e trace.

| Cenário | Dados | Resultado esperado | Evidência |
| --- | --- | --- | --- |
| Calibração | Julho/2026, fixture sanitizada | Valores em centavos iguais às expectativas | screenshot do resumo e memória |
| Aceitação | Agosto/2026, fixture sanitizada independente | Mesmo fluxo, sem reaproveitar resultado de Julho | screenshot do resumo e timeline |
| Segurança | usuário sem permissão sensível | resumo agregado visível; detalhe protegido indisponível | screenshot + URL + local/session storage |

## Jornada pela interface

| Etapa | Ação na UI | Critério de aceite | Gap a registrar |
| --- | --- | --- | --- |
| 1. Sessão | Entrar como operador sintético e escolher o workspace | nome do workspace e perfil aparecem; nenhuma credencial real | login não reproduzível localmente |
| 2. Competência | `Apuração de resultados` → `Abrir ou criar competência` | competência e versão aparecem em preparação | criação não exposta pela UI |
| 3. Fontes | Criar/configurar fontes e expectativa | fontes obrigatórias e opcionais indicadas na tela | configuração dependente de API direta |
| 4. Participantes e perfil | Configurar participantes, pontuação e perfil de importação | mapeamento e regras visíveis antes do upload | campo ou fluxo inexistente/confuso |
| 5. Importar workbook | Enviar fixture sanitizada | inventário mostra apenas abas-fonte; `GERAL` e `FECHAMENTO` não são publicáveis | aba indevida selecionável ou falha sem orientação |
| 6. Revisão guiada | Resolver fonte, participante desconhecido e exceções | usuário entende o que entra, o que foi excluído e por quê | ação sem feedback ou sem caminho de correção |
| 7. Preflight/publicação | Preparar, conferir e confirmar lote | estado publicado, fonte pronta e histórico preservado | publicação parcial, repetível ou ambígua |
| 8. Readiness | Voltar ao painel | quatro etapas refletem a prontidão real | estado exibido diverge do bloqueio real |
| 9. Deduções | Revisar fonte; criar dedução de origem; criar TM e TI | percentuais, base e reservas são legíveis antes do cálculo | TM/TI ausentes, misturadas com bruta ou sem justificativa |
| 10. Cálculo | `Continuar para o resultado` → `Calcular resultado` | total de origem, dedução, produtividade líquida, TM, TI e Valor a Receber exibidos | centavos divergentes ou memória ausente |
| 11. Memória | Abrir resumo/memória e valores por participante | quantidades, valores e reversões coincidem com expectativas | linha sem origem ou total inconsistente |
| 12. Cobertura | Criar/enviar proposta e confirmar cobertura | atestação exige justificativa, referência e confirmação explícita | aprovação permitida sem cobertura |
| 13. Produtividade | Criar, submeter e aprovar proposta | estado aprovado; obrigação provisionada uma vez; timeline preservada | duplicidade no replay ou estado sem evidência |
| 14. Margem | Criar, submeter e aprovar decisão de Margem | obrigação de Margem separada da Produtividade | tela/API não exposta para esta decisão |
| 15. Replay | Reenviar a aprovação com a mesma chave idempotente | nenhuma obrigação adicional; UI mantém a mesma decisão | duplicidade ou resposta confusa |
| 16. Usuário restrito | Repetir consulta com acesso sensível negado | resumo agregado permitido; detalhes protegidos não aparecem em URL, storage ou tela | vazamento de detalhe ou bloqueio excessivo |

## Verificações de valores

Para cada cenário, registrar no arquivo de expectativas versionado:

```text
fonte bruta (centavos)
- reversões (centavos)
- deduções por fonte (centavos)
= produtividade líquida (centavos)
- TM (centavos)
- TI (centavos)
= valor a receber por participante (centavos)
```

Não aceitar tolerância implícita. Registrar também a regra de arredondamento
aplicada pela jornada e o valor residual, se houver.

## Automação associada

| Comando | Objetivo |
| --- | --- |
| `npm run test:e2e:closing:ui` | prova que a competência é criada pela interface e que o browser não acessa `:8081` |
| `npm run test:e2e:closing` | prova automatizada local do fluxo de importação, cálculo, decisão, provisão e replay |

O segundo comando ainda possui preparação sintética pelo BFF. Durante esta
validação, qualquer passo que não possa ser realizado pela UI deve ser marcado
como **GAP UI**, e não preenchido por uma chamada interna. Esse registro define
o backlog necessário para a futura suíte funcional 100% visual.

## Registro de achados

| ID | Severidade | Gap | Estado atual | Critério de aceite |
| --- | --- | --- | --- | --- |
| FC-P0-001 | Bloqueante | O preflight deixava item de atribuição direta sem participante chegar à publicação e gerar `500`. | **Resolvido localmente**: preflight bloqueia candidatos sem participante, sem pool ou sem valor positivo; as linhas sem destinatário seguem a regra explícita de exclusão. | A publicação nunca responde `500` por restrição de item; a tela oferece caminho de revisão ou resumo da exclusão. |
| FC-P1-002 | Alta | A retomada era sequencial e exigia reconsiderar fontes já resolvidas, em vez de permitir seleção por fonte. | **Resolvido localmente**: a conferência lista o estado de cada fonte e permite retomar somente a pendente, preservando as materializadas. | A tela lista cada fonte com estado, pendências e ação `Retomar esta fonte`, sem reabrir fontes prontas. |
| FC-P1-003 | Alta | Não havia atualização incremental de arquivo por fonte com reaproveitamento seguro das decisões. | **Resolvido localmente**: `Atualizar esta fonte` compara o novo snapshot sem mutação, mostra itens inalterados/alterados/novos/removidos e decisões reutilizadas/invalidadas; a confirmação substitui apenas o staging da fonte e invalida o preflight. Decisões ligadas ao número da linha nunca atravessam snapshots; participante, zero e repetição só reaparecem por chaves compatíveis. | O operador atualiza uma fonte, vê fingerprint/diferenças e reaproveita somente decisões compatíveis, sem alterar as demais fontes. |

Copie uma entrada para cada achado:

```text
ID:
Cenário / etapa:
Classificação: GAP UI | GAP CÓDIGO | BLOQUEADO
Severidade: bloqueante | alta | média | baixa
Resultado observado:
Resultado esperado:
Evidência: screenshot / vídeo / trace / URL
Próxima decisão:
```
