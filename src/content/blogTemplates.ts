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
