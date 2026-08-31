export type BlogTemplateSection = {
  title: string
  prompt: string
  bullets?: string[]
  media?: BlogTemplateMedia[]
}

export type BlogTemplateMedia = {
  src: string
  alt: string
  caption?: string
}

export type BlogTemplateEntry = {
  slug: string
  kind?: 'template' | 'guide'
  category: string
  title: string
  excerpt: string
  readTime: string
  stage: string
  audience: string
  ctaLabel: string
  ctaPath: string
  downloadUrl?: string
  downloadLabel?: string
  videoSrc?: string
  videoPoster?: string
  heroPrompt: string
  summaryPrompt: string
  takeaways: string[]
  sections: BlogTemplateSection[]
}

type SupportedLocale = 'pt' | 'en'

const blogTemplateEntriesByLocale: Record<SupportedLocale, BlogTemplateEntry[]> = {
  pt: [
    {
      slug: 'como-importar-planilha-na-apuracao-de-resultados',
      kind: 'guide',
      category: 'Apuração de resultados',
      title: 'Como importar uma planilha na Apuração de resultados',
      excerpt:
        'Um roteiro seguro para transformar uma aba-fonte em itens normalizados, revisar exceções e recalcular a competência.',
      readTime: '7 min',
      stage: 'Operação',
      audience: 'Administradores que preparam o fechamento mensal a partir de fontes tabulares',
      ctaLabel: 'Abrir apuração de resultados',
      ctaPath: '/planning/financial-closings',
      heroPrompt:
        'A importação assistida reduz trabalho manual sem adivinhar identidade, origem ou regra financeira. Você configura a fonte e os participantes uma vez, reutiliza o perfil e confirma apenas o que foi validado.',
      summaryPrompt:
        'Use um arquivo CSV ou XLSX com uma única aba-fonte por upload. Antes de começar, separe abas de consolidação: elas servem para conferência externa e não devem ser enviadas como fonte. O arquivo bruto é usado na solicitação; a confirmação grava itens normalizados e proveniência protegida.',
      takeaways: [
        'Cada competência usa fontes e participantes canônicos próprios',
        'O perfil reutiliza a sourceKey estável, nunca o ID interno da versão',
        'Linhas desconhecidas bloqueiam a confirmação até receberem um mapa explícito'
      ],
      sections: [
        {
          title: '1. Inicie a competência e configure a base',
          prompt:
            'Abra Planejamento > Apuração de resultados e inicie a competência desejada. O fluxo cria o escopo DEFAULT em BRL. Depois, adicione cada fonte que será importada e os participantes que podem receber itens dessa competência.',
          bullets: [
            'Use uma chave de fonte estável, por exemplo BP_PAULISTA',
            'Use uma chave de participante estável, por exemplo ANA_SILVA',
            'Cadastre apenas fontes e participantes que pertencem à competência atual'
          ]
        },
        {
          title: '2. Crie ou escolha um perfil de importação',
          prompt:
            'No bloco Importar planilha, abra o mapeamento e informe os nomes das colunas do arquivo: chave do item, valor, data, referência externa e, quando existir, o participante como aparece na planilha. Salve o perfil com a sourceKey da fonte. Na próxima competência, ele só poderá ser usado quando essa mesma chave estiver configurada.',
          bullets: [
            'Um perfil guarda a estrutura da fonte e os mapas explícitos de participante',
            'A sourceKey BP_PAULISTA é resolvida para a fonte da versão corrente',
            'Não copie IDs internos do CoBudget para a planilha'
          ]
        },
        {
          title: '3. Envie uma aba-fonte e valide a prévia',
          prompt:
            'Envie um CSV ou XLSX de uma única aba-fonte e valide antes de confirmar. A prévia informa quantas linhas foram aceitas, ignoradas e marcadas como exceção, além dos totais de adições e reversões. Linhas vazias, totais, subtotais e fórmulas configuradas para ignorar não viram itens financeiros.',
          bullets: [
            'Valor negativo configurado pelo perfil vira REVERSAL com valor absoluto',
            'Confira os totais antes de confirmar o lote',
            'Uma aba de consolidação não substitui a validação da aba-fonte'
          ]
        },
        {
          title: '4. Resolva participantes desconhecidos sem dedução automática',
          prompt:
            'Quando um executor aparece no arquivo sem mapa explícito, a prévia mostra a exceção e a confirmação fica bloqueada. Escolha o participante canônico correto, adicione o mapeamento ao perfil, salve a nova versão e valide novamente. O sistema não tenta adivinhar pessoas por nome parecido.',
          bullets: [
            'Mapeie cada nome externo ao participante canônico correspondente',
            'Revise a nova versão do perfil antes de confirmar',
            'Se a pessoa ainda não existe, cadastre-a primeiro na competência'
          ]
        },
        {
          title: '5. Confirme, recalcule e confira a linha do tempo',
          prompt:
            'Com a validação válida, confirme o lote normalizado e recalcule a apuração. A confirmação invalida qualquer cálculo anterior, e o recálculo atualiza a matriz, a memória de cálculo e a central operacional. Reenviar o mesmo arquivo com a mesma chave idempotente reutiliza o resultado original, sem duplicar itens.',
          bullets: [
            'Confira a Produtividade Líquida e os totais por fonte',
            'Use a linha do tempo para ver importação confirmada e cálculo',
            'A cobertura de conciliação continua explícita: importar não é conciliar entrada bancária'
          ]
        },
        {
          title: '6. O que este fluxo não faz',
          prompt:
            'A importação assistida não interpreta automaticamente um Excel com várias abas, não cria participantes por aproximação e não reconcilia uma consolidação externa. Use cada aba-fonte como um upload próprio e mantenha a consolidação externa como material de conferência até que as diferenças sejam tratadas no processo apropriado.',
          bullets: [
            'Sem interpretação automática de regras específicas da planilha',
            'Sem transferência bancária ou pagamento durante a importação',
            'Sem ocultar diferenças de reconciliação'
          ]
        }
      ]
    },
    {
      slug: 'como-conectar-open-finance-e-verificar-transacoes',
      kind: 'guide',
      category: 'Open Finance',
      title: 'Como conectar o Open Finance e verificar suas transações no CoBudget',
      excerpt:
        'Conecte sua conta com segurança, entenda o que acontece no provedor e confirme se as transações chegaram corretamente.',
      readTime: '8 min',
      stage: 'Onboarding',
      audience: 'Fundadores, gestores e times que querem usar dados bancários reais no planejamento',
      ctaLabel: 'Abrir conexões',
      ctaPath: '/settings?tab=connections',
      videoSrc: '/blog-assets/openfinance/cobudget-openfinance-guia-pt.mp4',
      videoPoster: '/blog-assets/openfinance/cobudget-openfinance-guia-poster.jpg',
      heroPrompt:
        'A conexão Open Finance transforma movimentações bancárias em uma base real para orçamento, cenários e decisões. O CoBudget conduz o cadastro, abre a autorização segura no provedor e depois mostra o que foi sincronizado.',
      summaryPrompt:
        'Tenha em mãos os dados da conta e confirme que você pode conceder o consentimento. A autorização acontece no ambiente do provedor ou do banco; o CoBudget não armazena suas credenciais bancárias. Depois da autorização, a conferência final volta para a tela de conexões e para a lista de transações importadas.',
      takeaways: [
        'Open Finance fica em Configurações > Conexões',
        'A autorização acontece no provedor ou banco, fora do CoBudget',
        'A verificação final combina status da conexão, histórico de sincronização e transações'
      ],
      sections: [
        {
          title: '1. Onde encontrar a conexão',
          prompt:
            'No CoBudget, abra Configurações e entre em Conexões. A área Open Finance reúne conexões existentes, status de sincronização, histórico de importação e o atalho para revisar transações.',
          bullets: [
            'Abra Configurações',
            'Selecione Conexões',
            'Clique em Adicionar conexão'
          ]
        },
        {
          title: '2. O que preencher antes de ir ao banco',
          prompt:
            'O assistente pede titular, documento, dados cadastrais, banco, agência, conta e tipo de extrato inicial. Essas informações preparam o consentimento e ajudam o CoBudget a reconhecer a conta correta depois da autorização.',
          bullets: [
            'Use os dados do titular que vai autorizar a conexão',
            'Confira agência, conta e dígito antes de continuar',
            'Escolha o tipo de extrato que você quer importar primeiro'
          ]
        },
        {
          title: '3. O que acontece no provedor',
          prompt:
            'Depois de continuar para o banco, você verá telas do OpenFinance/Pluggly. Ali aparecem avisos de segurança, entrada de CPF, verificação do banco e progresso de autenticação. Essa etapa acontece fora do CoBudget, no fluxo seguro do provedor.',
          bullets: [
            'Leia a tela de segurança e privacidade antes de continuar',
            'Informe os dados solicitados pelo banco ou provedor',
            'Se o navegador bloquear pop-up, libere a janela ou clique em Conectar novamente'
          ],
          media: [
            {
              src: '/blog-assets/openfinance/pluggly-security.png',
              alt: 'Tela de segurança e privacidade do OpenFinance com Pluggly',
              caption: 'O provedor explica segurança e privacidade antes da autorização.'
            },
            {
              src: '/blog-assets/openfinance/pluggly-cpf.png',
              alt: 'Tela do provedor solicitando CPF para conectar a conta',
              caption: 'Alguns bancos pedem CPF ou confirmação adicional.'
            },
            {
              src: '/blog-assets/openfinance/pluggly-popup-blocked.png',
              alt: 'Aviso de pop-up bloqueado durante a verificação de segurança',
              caption: 'Se o pop-up for bloqueado, libere a janela e tente continuar.'
            },
            {
              src: '/blog-assets/openfinance/pluggly-sync-progress.png',
              alt: 'Tela de autenticação coletando dados da conta',
              caption: 'A coleta pode mostrar progresso enquanto o banco envia os dados.'
            },
            {
              src: '/blog-assets/openfinance/pluggly-success.png',
              alt: 'Tela de autenticação concluída com sucesso',
              caption: 'Quando a autorização termina, volte ao CoBudget para verificar o status.'
            },
            {
              src: '/blog-assets/openfinance/pluggly-already-linked.png',
              alt: 'Mensagem informando que a conta já está vinculada',
              caption: 'Se a conta já estiver vinculada, revise a conexão existente no CoBudget.'
            }
          ]
        },
        {
          title: '4. Como verificar se deu certo',
          prompt:
            'Volte para Configurações > Conexões e confira o status da conexão. O histórico mostra quando a sincronização rodou e quantas transações foram criadas, atualizadas, ignoradas ou marcadas com conflito.',
          bullets: [
            'Procure o status Ativa ou Sincronizada',
            'Abra o histórico da conexão',
            'Confira se houve transações criadas ou atualizadas'
          ]
        },
        {
          title: '5. Como revisar as transações',
          prompt:
            'Clique em Ver transações importadas ou vá até Transações e use o filtro Open Finance. Revise categoria, origem, visibilidade e se cada transação deve entrar no planejamento.',
          bullets: [
            'Filtre por Open Finance',
            'Revise categorias e descrições',
            'Confirme se a transação entra no orçamento e nos cenários'
          ]
        }
      ]
    },
    {
      slug: 'como-montar-um-cenario-financeiro',
      category: 'Cenários',
      title: 'Como montar um cenário financeiro sem transformar isso numa planilha gigante',
      excerpt:
        'Um caminho simples para simular uma decisão financeira com poucas variáveis e um resultado comparável.',
      readTime: '6 min',
      stage: 'Topo de funil',
      audience: 'Times pequenos, operações e famílias organizando escolhas financeiras',
      ctaLabel: 'Criar cenário',
      ctaPath: '/planning/scenarios/new',
      heroPrompt:
        'Um bom cenário não começa com uma planilha perfeita. Ele começa com uma pergunta clara: o que muda no caixa se eu seguir por este caminho?',
      summaryPrompt:
        'O objetivo é sair da intuição e chegar em uma comparação prática. Para isso, você precisa definir o ponto de partida, o horizonte da análise e apenas as mudanças que realmente afetam a decisão.',
      takeaways: [
        'Todo cenário precisa partir de um baseline claro',
        'Mudanças recorrentes e pontuais devem aparecer separadas',
        'O resultado só ajuda quando mostra impacto mensal, saldo projetado e risco'
      ],
      sections: [
        {
          title: '1. Contexto do problema',
          prompt:
            'A maioria das decisões financeiras parece confusa porque mistura expectativa, medo e muitos detalhes ao mesmo tempo. O cenário serve para reduzir a pergunta ao que importa: quanto entra, quanto sai e por quanto tempo.'
        },
        {
          title: '2. O que precisa entrar no cenário',
          prompt:
            'Comece pequeno. Um cenário útil precisa de poucas entradas bem definidas, não de uma cópia completa da vida financeira.',
          bullets: [
            'Receita ou entrada esperada',
            'Mudanças mensais',
            'Custos únicos',
            'Horizonte da análise'
          ]
        },
        {
          title: '3. Como transformar isso em decisão',
          prompt:
            'Compare o saldo projetado, o primeiro mês de risco e a folga disponível para metas. Se o cenário pressiona demais o caixa, ele não precisa ser descartado automaticamente, mas precisa voltar para revisão antes da decisão.'
        }
      ]
    },
    {
      slug: 'decisao-financeira-familia',
      category: 'Família',
      title: 'Como tomar uma decisão financeira em casal sem cada conversa parecer uma disputa',
      excerpt:
        'Uma forma mais clara de conversar sobre dinheiro quando a decisão afeta duas pessoas e um mesmo futuro.',
      readTime: '7 min',
      stage: 'Topo de funil',
      audience: 'Casais e famílias que precisam decidir juntos sem perder contexto',
      ctaLabel: 'Abrir decisões',
      ctaPath: '/decisions',
      heroPrompt:
        'Quando uma decisão financeira vira disputa, quase sempre falta uma coisa antes da conversa: um jeito comum de enxergar impacto, risco e prioridade.',
      summaryPrompt:
        'Dinheiro também é emocional, mas uma boa estrutura reduz ruído. Nomear a decisão, comparar opções e registrar o combinado ajuda a conversa a sair de opinião contra opinião.',
      takeaways: [
        'Nomeie a decisão sem transformar o tema em acusação',
        'Compare impacto e risco antes de discutir preferência',
        'Registre critério, voto e próximo passo para evitar retrabalho'
      ],
      sections: [
        {
          title: '1. Onde a conversa normalmente trava',
          prompt:
            'A conversa trava quando cada pessoa está defendendo uma solução diferente sem antes concordar sobre o problema. Antes de escolher, alinhe qual decisão está na mesa e qual risco vocês querem evitar.'
        },
        {
          title: '2. Um framework simples para comparar caminhos',
          prompt:
            'Coloque as opções lado a lado: pagar agora, esperar, parcelar, reduzir escopo ou buscar uma alternativa. Para cada caminho, olhe impacto mensal, saldo projetado e o que deixa de acontecer se a escolha for aprovada.'
        },
        {
          title: '3. Como sair da conversa com uma decisão concreta',
          prompt:
            'Uma decisão boa termina com três coisas registradas: o caminho escolhido, o motivo e quando ele será revisado. Isso transforma a conversa em alinhamento, não em memória seletiva.'
        }
      ]
    },
    {
      slug: 'guia-completo-apuracao-de-resultados',
      kind: 'guide',
      category: 'Apuração de resultados',
      title: 'Guia completo: da planilha à decisão de apuração',
      excerpt:
        'Um passo a passo ilustrado para transformar fontes em uma apuração auditável, calcular com regras flexíveis e preparar decisões.',
      readTime: '10 min',
      stage: 'Operação',
      audience: 'Gestores e administradores que organizam repasses, receitas e resultados periódicos',
      ctaLabel: 'Abrir apuração de resultados',
      ctaPath: '/planning/financial-closings',
      downloadUrl: '/guides/guia-apuracao-resultados-cobudget.pdf',
      downloadLabel: 'Baixar manual em PDF',
      heroPrompt:
        'A apuração organiza os dados de origem, as regras e as decisões em uma jornada única. Você revisa o que entra, calcula somente com regras explícitas e mantém rastreabilidade antes de autorizar valores.',
      summaryPrompt:
        'Comece pela competência, envie as planilhas que representam fontes reais e trate cada exceção com uma decisão explícita. A publicação não cria pagamento: ela apenas torna dados revisados disponíveis para o cálculo.',
      takeaways: [
        'Uma competência representa o período que você quer apurar',
        'Uma fonte é uma origem de valores, normalmente uma aba ou arquivo configurado',
        'Regras, cobertura e decisões podem ser revisadas antes da autorização'
      ],
      sections: [
        {
          title: '1. Crie ou abra a competência do mês',
          prompt:
            'Abra Planejamento > Apuração de resultados, escolha o mês e crie ou abra a competência. Quando a competência DEFAULT daquele mês já existe, o CoBudget a reabre em vez de duplicar dados.',
          bullets: [
            'Use uma nova competência para outro período',
            'Use a mesma competência para corrigir ou complementar dados antes da decisão final',
            'A versão registra revisões sem misturar períodos diferentes'
          ],
          media: [
            { src: '/blog-assets/financial-closing/competencia.svg', alt: 'Ilustração da escolha de competência na Apuração de resultados', caption: 'A competência identifica o mês e o escopo da apuração.' }
          ]
        },
        {
          title: '2. Envie o workbook e configure as fontes',
          prompt:
            'Envie o Excel e escolha, aba por aba, o que representa uma fonte financeira. Uma aba de resumo, consolidação ou apoio não entra automaticamente: você pode ignorá-la ou configurá-la como fonte quando ela representar valores reais.',
          bullets: [
            'Dê nome e chave estáveis a cada fonte',
            'Escolha ou crie o perfil que interpreta suas colunas',
            'Prepare lote adicional quando houver novos dados, sem duplicar itens sobrepostos'
          ],
          media: [
            { src: '/blog-assets/financial-closing/revisao-fontes.svg', alt: 'Ilustração da revisão assistida de fontes e exceções', caption: 'O sistema só pede intervenção nas exceções que precisam de decisão humana.' }
          ]
        },
        {
          title: '3. Revise participantes, repetições e linhas inválidas',
          prompt:
            'Antes da publicação, associe participantes, confirme multiplicidades legítimas e trate linhas inválidas. O CoBudget não adivinha pessoas nem descarta valores silenciosamente. Uma exclusão exige justificativa e fica auditada.',
          bullets: [
            'Repetições legítimas podem ser preservadas',
            'Linhas incorretas podem ser corrigidas ou excluídas com justificativa',
            'Nenhum dado entra no cálculo antes da confirmação do lote'
          ]
        },
        {
          title: '4. Prepare e publique os dados de origem',
          prompt:
            'Confira fontes, itens, adições, reversões e exclusões; depois, confirme a publicação. A publicação é atômica e cria a base canônica da apuração. Ela não calcula, não autoriza e não transfere dinheiro.',
          bullets: [
            'Use Ver publicação para conferir o que entrou',
            'A fonte publicada permanece rastreável',
            'Se precisar complementar antes da decisão, prepare um novo lote compatível'
          ]
        },
        {
          title: '5. Configure apenas as regras que se aplicam ao negócio',
          prompt:
            'Deduções, impostos, reservas, pontuação e equivalências monetárias são opcionais e explícitos. Sem regra criada, não há taxa implícita. Regras por fonte incidem na receita da fonte; regras posteriores destinam a Produtividade Líquida.',
          bullets: [
            'Deduções de fonte são aplicadas depois das reversões',
            'TM, TI e outras reservas só aparecem quando configuradas',
            'Alterar uma regra cria nova revisão e torna o cálculo anterior obsoleto'
          ],
          media: [
            { src: '/blog-assets/financial-closing/regras-calculo.svg', alt: 'Ilustração de regras opcionais e prévia de cálculo', caption: 'O cálculo usa somente as regras configuradas e revisadas por você.' }
          ]
        },
        {
          title: '6. Calcule, confira a memória e confirme a cobertura',
          prompt:
            'Calcule o resultado e confira a memória agregada por fonte e participante. A cobertura confirma que as entradas publicadas foram conferidas. Se algo estiver errado, volte às fontes ou regras antes de enviar uma proposta.',
          bullets: [
            'Confira valor bruto, reversões, deduções e Produtividade Líquida',
            'A memória detalhada segue as permissões de acesso sensível',
            'O cálculo pode ser refeito quando uma revisão válida o exigir'
          ]
        },
        {
          title: '7. Prepare a decisão de Produtividade e trate a Margem separadamente',
          prompt:
            'Crie uma proposta apenas quando os valores estiverem corretos. Enquanto estiver em rascunho, a proposta pode ser descartada para revisar dados e regras. A decisão de Margem continua independente da Produtividade.',
          bullets: [
            'Rascunho não emite obrigação nem transfere dinheiro',
            'Revise participantes, valores e vencimentos antes de enviar',
            'Envie para autorização somente quando a proposta estiver pronta'
          ],
          media: [
            { src: '/blog-assets/financial-closing/decisao.svg', alt: 'Ilustração de uma proposta de produtividade em rascunho', caption: 'A proposta permanece em rascunho até você enviá-la para autorização.' }
          ]
        }
      ]
    },
    {
      slug: 'vale-parcelar-ou-pagar-agora',
      category: 'Comparativos',
      title: 'Vale parcelar ou pagar agora?',
      excerpt:
        'Como comparar desconto, juros e segurança de caixa antes de escolher entre quitar agora ou ganhar prazo.',
      readTime: '8 min',
      stage: 'Meio de funil',
      audience:
        'Quem está avaliando quitar agora, parcelar ou buscar uma alternativa intermediária',
      ctaLabel: 'Abrir playbook',
      ctaPath: '/app/blog/playbooks/pay-now-or-installments',
      heroPrompt:
        'Pagar agora pode ser mais barato. Parcelar pode preservar caixa. A melhor escolha depende do custo total e da folga que sobra depois da decisão.',
      summaryPrompt:
        'A decisão não deve ser tomada só pelo valor da parcela ou pelo desconto à vista. Compare custo final, pressão mensal, previsibilidade e risco de deixar o caixa curto demais.',
      takeaways: [
        'Quando o desconto à vista compensa',
        'Quando o parcelamento protege o caixa',
        'Como comparar previsibilidade com custo final'
      ],
      sections: [
        {
          title: '1. O erro de olhar só o valor da parcela',
          prompt:
            'Uma parcela pequena pode parecer leve, mas compromissos recorrentes se acumulam. O primeiro passo é entender quanto a escolha adiciona aos próximos meses e se ela reduz sua margem de segurança.'
        },
        {
          title: '2. Como comparar as opções na prática',
          prompt:
            'Compare cada opção usando os mesmos critérios. O melhor caminho não é sempre o mais barato, e sim o que combina custo aceitável com caixa suficiente para atravessar os próximos meses.',
          bullets: [
            'Custo final',
            'Impacto no caixa do mês',
            'Folga operacional',
            'Risco de receita'
          ]
        },
        {
          title: '3. Como decidir com simulação',
          prompt:
            'Simule pagar agora, parcelar e uma alternativa intermediária. Quando os caminhos aparecem lado a lado, a decisão deixa de ser uma sensação e vira uma escolha com trade-off explícito.'
        }
      ]
    }
  ],
  en: [
    {
      slug: 'como-importar-planilha-na-apuracao-de-resultados',
      kind: 'guide',
      category: 'Financial closing',
      title: 'How to import a spreadsheet into Financial Closing',
      excerpt:
        'A safe workflow for turning one source worksheet into normalized items, reviewing exceptions, and recalculating the period.',
      readTime: '7 min',
      stage: 'Operations',
      audience: 'Administrators who prepare monthly closing from tabular sources',
      ctaLabel: 'Open financial closing',
      ctaPath: '/planning/financial-closings',
      heroPrompt:
        'Assisted import reduces manual work without guessing identity, source, or financial rules. Configure sources and participants once, reuse the profile, and confirm only what has been validated.',
      summaryPrompt:
        'Use a CSV or XLSX file with one source worksheet per upload. Keep consolidation worksheets separate: they are external review material and must not be uploaded as a source. The raw file is used for the request; confirmation stores normalized items and protected provenance.',
      takeaways: [
        'Each period has its own canonical sources and participants',
        'A profile reuses a stable sourceKey, never a version internal ID',
        'Unknown rows block confirmation until they receive an explicit mapping'
      ],
      sections: [
        {
          title: '1. Start the period and configure its foundation',
          prompt:
            'Open Planning > Financial Closing and start the period you need. The flow creates the DEFAULT scope in BRL. Then add each source you will import and the participants that can receive items in that period.',
          bullets: [
            'Use a stable source key, such as BP_PAULISTA',
            'Use a stable participant key, such as ANA_SILVA',
            'Register only sources and participants that belong to the current period'
          ]
        },
        {
          title: '2. Create or select an import profile',
          prompt:
            'In Import spreadsheet, open the mapping and enter the file column names: item key, amount, date, external reference, and, when present, the participant label from the spreadsheet. Save the profile using the source sourceKey. In another period, it can be used only if that same key is configured there.',
          bullets: [
            'A profile stores source structure and explicit participant mappings',
            'BP_PAULISTA is resolved to the source in the current closing version',
            'Do not copy CoBudget internal IDs into the spreadsheet'
          ]
        },
        {
          title: '3. Upload one source worksheet and validate the preview',
          prompt:
            'Upload a CSV or one-sheet XLSX source and validate before confirmation. The preview reports accepted, ignored, and exception rows, as well as addition and reversal totals. Blank rows, totals, subtotals, and configured formula rows do not become financial items.',
          bullets: [
            'A negative amount configured by the profile becomes a REVERSAL with absolute value',
            'Review totals before confirming the batch',
            'A consolidation worksheet does not replace source validation'
          ]
        },
        {
          title: '4. Resolve unknown participants without automatic inference',
          prompt:
            'When an executor in the file has no explicit mapping, the preview displays an exception and confirmation remains blocked. Select the right canonical participant, add the mapping to the profile, save the new version, and validate again. The system never guesses people from similar names.',
          bullets: [
            'Map every external label to its canonical participant',
            'Review the new profile version before confirmation',
            'If the person does not exist yet, add them to the period first'
          ]
        },
        {
          title: '5. Confirm, recalculate, and review the timeline',
          prompt:
            'Once validation is valid, confirm the normalized batch and recalculate. Confirmation invalidates the previous calculation, while recalculation updates the matrix, calculation memory, and operations center. Re-uploading the same file with the same idempotency key reuses the original result without duplicating items.',
          bullets: [
            'Review Net Productivity and source totals',
            'Use the timeline to see confirmed import and calculation',
            'Reconciliation coverage stays explicit: importing is not bank reconciliation'
          ]
        },
        {
          title: '6. What this workflow does not do',
          prompt:
            'Assisted import does not automatically interpret a multi-sheet workbook, create participants from approximate names, or reconcile an external consolidation. Upload each source worksheet separately and keep external consolidation as review material until differences are handled in the proper process.',
          bullets: [
            'No automatic interpretation of spreadsheet-specific rules',
            'No bank transfer or payment during import',
            'No hidden reconciliation differences'
          ]
        }
      ]
    },
    {
      slug: 'como-conectar-open-finance-e-verificar-transacoes',
      kind: 'guide',
      category: 'Open Finance',
      title: 'How to connect Open Finance and verify transactions in CoBudget',
      excerpt:
        'Connect an account safely, understand what happens in the provider flow, and confirm imported transactions.',
      readTime: '8 min',
      stage: 'Onboarding',
      audience: 'Founders, managers, and teams that want real banking data in planning',
      ctaLabel: 'Open connections',
      ctaPath: '/settings?tab=connections',
      videoSrc: '/blog-assets/openfinance/cobudget-openfinance-guia-pt.mp4',
      videoPoster: '/blog-assets/openfinance/cobudget-openfinance-guia-poster.jpg',
      heroPrompt:
        'The Open Finance connection turns bank activity into a real baseline for budgets, scenarios, and decisions. CoBudget guides the setup, opens the secure provider authorization, and then shows what was synced.',
      summaryPrompt:
        'Have the account details ready and confirm that you can grant consent. Authorization happens in the provider or bank environment; CoBudget does not store your banking credentials. After authorization, final verification happens in the connections screen and in the imported transactions list.',
      takeaways: [
        'Open Finance lives in Settings > Connections',
        'Authorization happens in the provider or bank, outside CoBudget',
        'Final verification combines connection status, sync history, and imported transactions'
      ],
      sections: [
        {
          title: '1. Where to find the connection',
          prompt:
            'In CoBudget, open Settings and go to Connections. The Open Finance area shows existing connections, sync status, import history, and the shortcut to review transactions.',
          bullets: ['Open Settings', 'Select Connections', 'Click Add connection']
        },
        {
          title: '2. What to fill before going to the bank',
          prompt:
            'The assistant asks for owner, document, profile data, bank, branch, account, and initial statement type. These details prepare consent and help CoBudget recognize the right account after authorization.',
          bullets: [
            'Use the details of the owner who will authorize the connection',
            'Check branch, account, and digit before continuing',
            'Choose the statement type you want to import first'
          ]
        },
        {
          title: '3. What happens in the provider',
          prompt:
            'After continuing to the bank, you will see OpenFinance/Pluggly screens. They may show security notices, CPF entry, bank verification, and authentication progress. This step happens outside CoBudget in the provider secure flow.',
          bullets: [
            'Read the security and privacy screen before continuing',
            'Enter the data requested by the bank or provider',
            'If the browser blocks a pop-up, allow the window or click Connect again'
          ],
          media: [
            {
              src: '/blog-assets/openfinance/pluggly-security.png',
              alt: 'OpenFinance security and privacy screen with Pluggly',
              caption: 'The provider explains security and privacy before authorization.'
            },
            {
              src: '/blog-assets/openfinance/pluggly-cpf.png',
              alt: 'Provider screen asking for CPF to connect the account',
              caption: 'Some banks ask for CPF or an additional confirmation.'
            },
            {
              src: '/blog-assets/openfinance/pluggly-popup-blocked.png',
              alt: 'Blocked pop-up warning during security verification',
              caption: 'If a pop-up is blocked, allow the window and try continuing.'
            },
            {
              src: '/blog-assets/openfinance/pluggly-sync-progress.png',
              alt: 'Authentication screen collecting account data',
              caption: 'Collection may show progress while the bank sends the data.'
            },
            {
              src: '/blog-assets/openfinance/pluggly-success.png',
              alt: 'Authentication completed successfully',
              caption: 'When authorization finishes, return to CoBudget to check status.'
            },
            {
              src: '/blog-assets/openfinance/pluggly-already-linked.png',
              alt: 'Message saying the account is already linked',
              caption: 'If the account is already linked, review the existing CoBudget connection.'
            }
          ]
        },
        {
          title: '4. How to verify it worked',
          prompt:
            'Return to Settings > Connections and check the connection status. The history shows when sync ran and how many transactions were created, updated, ignored, or marked with conflict.',
          bullets: [
            'Look for Active or Synced status',
            'Open the connection history',
            'Check whether transactions were created or updated'
          ]
        },
        {
          title: '5. How to review transactions',
          prompt:
            'Click View imported transactions or go to Transactions and use the Open Finance filter. Review category, source, visibility, and whether the transaction should enter planning.',
          bullets: [
            'Filter by Open Finance',
            'Review categories and descriptions',
            'Confirm whether the transaction enters budgets and scenarios'
          ]
        }
      ]
    },
    {
      slug: 'como-montar-um-cenario-financeiro',
      category: 'Scenarios',
      title: 'How to build a financial scenario without turning it into a giant spreadsheet',
      excerpt:
        'A simple way to simulate a financial decision with a few variables and a comparable outcome.',
      readTime: '6 min',
      stage: 'Top of funnel',
      audience: 'Small teams, operations, and families organizing financial choices',
      ctaLabel: 'Create scenario',
      ctaPath: '/planning/scenarios/new',
      heroPrompt:
        'A good scenario does not start with a perfect spreadsheet. It starts with a clear question: what changes in cashflow if I choose this path?',
      summaryPrompt:
        'The goal is to move from intuition into practical comparison. Define the starting point, the time horizon, and only the changes that affect the decision.',
      takeaways: [
        'Every scenario needs a clear baseline',
        'Recurring and one-time changes should stay separate',
        'The result is useful when it shows monthly impact, projected balance, and risk'
      ],
      sections: [
        {
          title: '1. Problem context',
          prompt:
            'Most financial decisions feel confusing because they mix expectations, fear, and too much detail. A scenario reduces the question to what matters: what comes in, what goes out, and for how long.'
        },
        {
          title: '2. What needs to go into the scenario',
          prompt:
            'Start small. A useful scenario needs a few well-defined inputs, not a full copy of your financial life.',
          bullets: [
            'Expected income or inflow',
            'Monthly changes',
            'One-time costs',
            'Analysis horizon'
          ]
        },
        {
          title: '3. How to turn this into a decision',
          prompt:
            'Compare projected balance, first risk month, and available room for goals. If the scenario puts too much pressure on cashflow, it does not need to be rejected automatically, but it should be reviewed before approval.'
        }
      ]
    },
    {
      slug: 'decisao-financeira-familia',
      category: 'Family',
      title:
        'How to make a financial decision as a couple without every conversation feeling like a dispute',
      excerpt:
        'A clearer way to talk about money when the decision affects two people and the same future.',
      readTime: '7 min',
      stage: 'Top of funnel',
      audience: 'Couples and families who need to decide together without losing context',
      ctaLabel: 'Open decisions',
      ctaPath: '/decisions',
      heroPrompt:
        'When a financial decision turns into a dispute, one thing is usually missing before the conversation: a shared way to see impact, risk, and priority.',
      summaryPrompt:
        'Money is emotional, but structure reduces noise. Naming the decision, comparing paths, and recording the agreement helps the conversation move beyond opinion versus opinion.',
      takeaways: [
        'Name the decision without turning it into blame',
        'Compare impact and risk before debating preference',
        'Record criteria, vote, and next step to avoid rework'
      ],
      sections: [
        {
          title: '1. Where the conversation usually gets stuck',
          prompt:
            'The conversation gets stuck when each person defends a different solution before agreeing on the problem. Before choosing, align on the decision at hand and the risk you want to avoid.'
        },
        {
          title: '2. A simple framework to compare paths',
          prompt:
            'Put options side by side: pay now, wait, split into installments, reduce scope, or look for another path. For each one, check monthly impact, projected balance, and what stops happening if the choice is approved.'
        },
        {
          title: '3. How to leave the conversation with a concrete decision',
          prompt:
            'A good decision ends with three things recorded: the chosen path, the reason, and when it will be reviewed. That turns the conversation into alignment, not selective memory.'
        }
      ]
    },
    {
      slug: 'vale-parcelar-ou-pagar-agora',
      category: 'Comparisons',
      title: 'Should I pay now or in installments?',
      excerpt:
        'How to compare discounts, interest, and cash safety before choosing whether to pay now or gain time.',
      readTime: '8 min',
      stage: 'Middle of funnel',
      audience:
        'People deciding whether to pay now, split into installments, or use an in-between alternative',
      ctaLabel: 'Open playbook',
      ctaPath: '/app/blog/playbooks/pay-now-or-installments',
      heroPrompt:
        'Paying now can be cheaper. Installments can preserve cash. The better choice depends on total cost and the buffer left after the decision.',
      summaryPrompt:
        'The decision should not be based only on installment size or cash discount. Compare final cost, monthly pressure, predictability, and the risk of leaving cash too tight.',
      takeaways: [
        'When a cash discount pays off',
        'When installments protect cashflow',
        'How to compare predictability with final cost'
      ],
      sections: [
        {
          title: '1. The mistake of looking only at the installment amount',
          prompt:
            'A small installment can look harmless, but recurring commitments add up. Start by understanding how much the choice adds to the coming months and whether it reduces your safety margin.'
        },
        {
          title: '2. How to compare the options in practice',
          prompt:
            'Compare every option using the same criteria. The best path is not always the cheapest one, but the one that combines acceptable cost with enough cash to get through the coming months.',
          bullets: [
            'Total cost',
            'Impact on this month’s cashflow',
            'Operating buffer',
            'Revenue risk'
          ]
        },
        {
          title: '3. How to decide with simulation',
          prompt:
            'Simulate paying now, splitting into installments, and an intermediate alternative. Once the paths appear side by side, the decision stops being a feeling and becomes an explicit trade-off.'
        }
      ]
    }
  ]
}

export const featuredBlogTemplateSlug = 'como-conectar-open-finance-e-verificar-transacoes'

const normalizeLocale = (locale?: string): SupportedLocale =>
  String(locale || '').toLowerCase().startsWith('en') ? 'en' : 'pt'

export const getBlogTemplateEntries = (locale?: string) =>
  blogTemplateEntriesByLocale[normalizeLocale(locale)]

export const getBlogTemplateEntry = (slug: string, locale?: string) =>
  getBlogTemplateEntries(locale).find((entry) => entry.slug === slug) || null
