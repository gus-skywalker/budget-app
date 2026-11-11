# Apuração de Resultados — E2E local

Execute a prova local completa com:

```bash
npm run test:e2e:closing
```

Para a ferramenta de homologação das incidências financeiras, use:

```bash
npm run test:e2e:closing:homologation
```

Ela usa somente a fixture sanitizada e confere em centavos a sequência
bruto da fonte → dedução → ajuste individual → PL → TM/TI → Valor a Receber.
As expectativas ficam em `fixtures/expected-results.json`; a planilha real
permanece somente na conferência manual local descrita no playbook compartilhado.

Para uma prova isolada da interface pública (sem `APIRequestContext` na spec), use:

```bash
npm run test:e2e:closing:ui
```

O roteiro completo para a rodada manual e para registrar gaps está em
[`financial-closing-validation.md`](financial-closing-validation.md).

O comando inicia uma topologia local descartável em `127.0.0.1`:

- `budget-app`: 5173
- `budget-api` (BFF público): 8080
- `financial-closing-service`: 8081

As fixtures em `fixtures/` são inteiramente sintéticas. `closing-v31-happy.xlsx`
é a calibração de julho e `closing-v31-second-lot.xlsx` prova inclusão,
substituição e retirada de um segundo lote. Ambas usam somente a aba-fonte
`V31_SOURCE`; abas de
consolidação como `GERAL` e conferência como `FECHAMENTO` nunca são selecionadas
para importação. Valores são comparados em centavos exatos; o cenário usa ponto
como separador decimal e arredondamento monetário HALF_UP no serviço. O arquivo
`fixtures/expected-results.json` mantém as expectativas explícitas em centavos;
um novo mês exige apenas sua fixture sanitizada e a entrada correspondente nesse
arquivo.

A jornada passa pelo navegador e pelo BFF; o navegador nunca aponta para 8081.
Ela cobre a base editável com múltiplos lotes, retirada, substituição,
invalidação e recálculo, publicação financeira final, regras e deduções,
cálculo, memória/resumo, atestação de
cobertura, decisão de produtividade, emissão idempotente de obrigação e a
decisão de margem separada. Em falhas, trace, vídeo e screenshot ficam em
`test-results/financial-closing`; o relatório HTML fica em
`playwright-report/financial-closing` e o JUnit em
`test-results/financial-closing/junit.xml`.

Pré-requisitos: Java 21, PostgreSQL local para o `financial-closing-service`,
dependências instaladas nos três projetos e navegadores Playwright instalados.
Em estações locais que tenham apenas o JDK 24, o harness usa um fallback de execução
compatível com Java 21, sem alterar o build do serviço.
