export type BlogTemplateSection = {
  title: string
  prompt: string
  bullets?: string[]
}

export type BlogTemplateEntry = {
  slug: string
  category: string
  title: string
  excerpt: string
  readTime: string
  stage: string
  audience: string
  ctaLabel: string
  ctaPath: string
  heroPrompt: string
  summaryPrompt: string
  takeaways: string[]
  sections: BlogTemplateSection[]
}

type SupportedLocale = 'pt' | 'en'

const blogTemplateEntriesByLocale: Record<SupportedLocale, BlogTemplateEntry[]> = {
  pt: [
    {
      slug: 'como-montar-um-cenario-financeiro',
      category: 'Cenários',
      title: 'Como montar um cenário financeiro sem transformar isso numa planilha gigante',
      excerpt:
        'Template para um artigo educacional sobre como estruturar cenários com clareza e baixo atrito.',
      readTime: '6 min',
      stage: 'Topo de funil',
      audience: 'Times pequenos, operações e famílias organizando escolhas financeiras',
      ctaLabel: 'Criar cenário',
      ctaPath: '/planning/scenarios/new',
      heroPrompt:
        'Explique o problema inicial, por que as pessoas travam ao simular e qual resultado prático este artigo promete.',
      summaryPrompt:
        'Resuma em 3 a 4 linhas como o artigo ajuda a sair da intuição e chegar em um cenário comparável.',
      takeaways: [
        'Qual decisão esse tipo de cenário ajuda a tomar',
        'Quais entradas mínimas precisam existir',
        'Como evitar excesso de detalhe logo no primeiro uso'
      ],
      sections: [
        {
          title: '1. Contexto do problema',
          prompt: 'Inserir aqui a abertura do artigo com a dor principal e um exemplo concreto.'
        },
        {
          title: '2. O que precisa entrar no cenário',
          prompt: 'Listar os componentes mínimos que tornam a simulação útil.',
          bullets: [
            'Receita ou entrada esperada',
            'Mudanças mensais',
            'Custos únicos',
            'Horizonte da análise'
          ]
        },
        {
          title: '3. Como transformar isso em decisão',
          prompt: 'Conectar a simulação com a escolha que a pessoa precisa fazer.'
        }
      ]
    },
    {
      slug: 'decisao-financeira-familia',
      category: 'Família',
      title: 'Como tomar uma decisão financeira em casal sem cada conversa parecer uma disputa',
      excerpt:
        'Template para um artigo sobre alinhamento, trade-offs e como conversar sobre dinheiro com mais clareza.',
      readTime: '7 min',
      stage: 'Topo de funil',
      audience: 'Casais e famílias que precisam decidir juntos sem perder contexto',
      ctaLabel: 'Abrir decisões',
      ctaPath: '/decisions',
      heroPrompt:
        'Introduzir o conflito comum, mostrar empatia e prometer um caminho estruturado de conversa.',
      summaryPrompt:
        'Explicar rapidamente por que o problema não é só emocional, mas também de falta de estrutura de decisão.',
      takeaways: [
        'Como nomear a decisão sem acusação',
        'Como comparar opções sem virar debate infinito',
        'Como registrar critério e próximo passo'
      ],
      sections: [
        {
          title: '1. Onde a conversa normalmente trava',
          prompt: 'Descrever os padrões de conflito e a origem da falta de clareza.'
        },
        {
          title: '2. Um framework simples para comparar caminhos',
          prompt: 'Explicar como organizar alternativas, critérios e impacto esperado.'
        },
        {
          title: '3. Como sair da conversa com uma decisão concreta',
          prompt: 'Mostrar como sintetizar escolha, prazo e revisão futura.'
        }
      ]
    },
    {
      slug: 'vale-parcelar-ou-pagar-agora',
      category: 'Comparativos',
      title: 'Vale parcelar ou pagar agora?',
      excerpt:
        'Template para um artigo comparativo focado em liquidez, custo total e previsibilidade.',
      readTime: '8 min',
      stage: 'Meio de funil',
      audience:
        'Quem está avaliando quitar agora, parcelar ou buscar uma alternativa intermediária',
      ctaLabel: 'Abrir playbook',
      ctaPath: '/app/blog/playbooks/pay-now-or-installments',
      heroPrompt:
        'Abrir com a tensão entre pagar menos e preservar caixa, sem cair em resposta simplista.',
      summaryPrompt:
        'Explicar como o artigo ajuda a comparar custo total, pressão mensal e segurança operacional.',
      takeaways: [
        'Quando o desconto à vista compensa',
        'Quando o parcelamento protege o caixa',
        'Como comparar previsibilidade com custo final'
      ],
      sections: [
        {
          title: '1. O erro de olhar só o valor da parcela',
          prompt: 'Mostrar por que parcela pequena pode esconder um custo ruim.'
        },
        {
          title: '2. Como comparar as opções na prática',
          prompt: 'Descrever quais números e sinais precisam entrar na comparação.',
          bullets: [
            'Custo final',
            'Impacto no caixa do mês',
            'Folga operacional',
            'Risco de receita'
          ]
        },
        {
          title: '3. Como decidir com simulação',
          prompt: 'Fechar conectando o conteúdo ao playbook ou fluxo do produto.'
        }
      ]
    }
  ],
  en: [
    {
      slug: 'como-montar-um-cenario-financeiro',
      category: 'Scenarios',
      title: 'How to build a financial scenario without turning it into a giant spreadsheet',
      excerpt:
        'Template for an educational article on how to structure scenarios with clarity and low friction.',
      readTime: '6 min',
      stage: 'Top of funnel',
      audience: 'Small teams, operations, and families organizing financial choices',
      ctaLabel: 'Create scenario',
      ctaPath: '/planning/scenarios/new',
      heroPrompt:
        'Explain the initial problem, why people get stuck when simulating, and what practical outcome this article promises.',
      summaryPrompt:
        'Summarize in 3 to 4 lines how the article helps move from intuition to a comparable scenario.',
      takeaways: [
        'What decision this type of scenario helps with',
        'What minimum inputs need to exist',
        'How to avoid too much detail in the first use'
      ],
      sections: [
        {
          title: '1. Problem context',
          prompt: 'Insert the opening of the article here with the core pain and a concrete example.'
        },
        {
          title: '2. What needs to go into the scenario',
          prompt: 'List the minimum components that make the simulation useful.',
          bullets: [
            'Expected income or inflow',
            'Monthly changes',
            'One-time costs',
            'Analysis horizon'
          ]
        },
        {
          title: '3. How to turn this into a decision',
          prompt: 'Connect the simulation to the choice the person needs to make.'
        }
      ]
    },
    {
      slug: 'decisao-financeira-familia',
      category: 'Family',
      title:
        'How to make a financial decision as a couple without every conversation feeling like a dispute',
      excerpt:
        'Template for an article about alignment, trade-offs, and how to talk about money with more clarity.',
      readTime: '7 min',
      stage: 'Top of funnel',
      audience: 'Couples and families who need to decide together without losing context',
      ctaLabel: 'Open decisions',
      ctaPath: '/decisions',
      heroPrompt:
        'Introduce the common conflict, show empathy, and promise a structured path for the conversation.',
      summaryPrompt:
        'Quickly explain why the problem is not only emotional, but also a lack of decision structure.',
      takeaways: [
        'How to name the decision without blame',
        'How to compare options without turning it into an endless debate',
        'How to register criteria and the next step'
      ],
      sections: [
        {
          title: '1. Where the conversation usually gets stuck',
          prompt: 'Describe the conflict patterns and the source of the lack of clarity.'
        },
        {
          title: '2. A simple framework to compare paths',
          prompt: 'Explain how to organize alternatives, criteria, and expected impact.'
        },
        {
          title: '3. How to leave the conversation with a concrete decision',
          prompt: 'Show how to synthesize the choice, timeline, and future review.'
        }
      ]
    },
    {
      slug: 'vale-parcelar-ou-pagar-agora',
      category: 'Comparisons',
      title: 'Should I pay now or in installments?',
      excerpt:
        'Template for a comparison article focused on liquidity, total cost, and predictability.',
      readTime: '8 min',
      stage: 'Middle of funnel',
      audience:
        'People deciding whether to pay now, split into installments, or use an in-between alternative',
      ctaLabel: 'Open playbook',
      ctaPath: '/app/blog/playbooks/pay-now-or-installments',
      heroPrompt:
        'Open with the tension between paying less and preserving cash without falling into a simplistic answer.',
      summaryPrompt:
        'Explain how the article helps compare total cost, monthly pressure, and operating safety.',
      takeaways: [
        'When a cash discount pays off',
        'When installments protect cashflow',
        'How to compare predictability with final cost'
      ],
      sections: [
        {
          title: '1. The mistake of looking only at the installment amount',
          prompt: 'Show why a small installment can hide a bad overall cost.'
        },
        {
          title: '2. How to compare the options in practice',
          prompt: 'Describe which numbers and signals need to enter the comparison.',
          bullets: [
            'Total cost',
            'Impact on this month’s cashflow',
            'Operating buffer',
            'Revenue risk'
          ]
        },
        {
          title: '3. How to decide with simulation',
          prompt: 'Close by connecting the content to the playbook or product flow.'
        }
      ]
    }
  ]
}

export const featuredBlogTemplateSlug = 'vale-parcelar-ou-pagar-agora'

const normalizeLocale = (locale?: string): SupportedLocale =>
  String(locale || '').toLowerCase().startsWith('en') ? 'en' : 'pt'

export const getBlogTemplateEntries = (locale?: string) =>
  blogTemplateEntriesByLocale[normalizeLocale(locale)]

export const getBlogTemplateEntry = (slug: string, locale?: string) =>
  getBlogTemplateEntries(locale).find((entry) => entry.slug === slug) || null
