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

export const blogTemplateEntries: BlogTemplateEntry[] = [
  {
    slug: 'como-montar-um-cenario-financeiro',
    category: 'Cenarios',
    title: 'Como montar um cenario financeiro sem transformar isso numa planilha gigante',
    excerpt:
      'Template para um artigo educacional sobre como estruturar cenarios com clareza e baixo atrito.',
    readTime: '6 min',
    stage: 'Topo de funil',
    audience: 'Times pequenos, operacoes e familias organizando escolhas financeiras',
    ctaLabel: 'Criar cenario',
    ctaPath: '/planning/scenarios/new',
    heroPrompt:
      'Explique o problema inicial, por que as pessoas travam ao simular e qual resultado pratico este artigo promete.',
    summaryPrompt:
      'Resuma em 3 a 4 linhas como o artigo ajuda a sair da intuicao e chegar em um cenario comparavel.',
    takeaways: [
      'Qual decisao esse tipo de cenario ajuda a tomar',
      'Quais entradas minimas precisam existir',
      'Como evitar excesso de detalhe logo no primeiro uso'
    ],
    sections: [
      {
        title: '1. Contexto do problema',
        prompt: 'Inserir aqui a abertura do artigo com a dor principal e um exemplo concreto.'
      },
      {
        title: '2. O que precisa entrar no cenario',
        prompt: 'Listar os componentes minimos que tornam a simulacao util.',
        bullets: [
          'Receita ou entrada esperada',
          'Mudancas mensais',
          'Custos unicos',
          'Horizonte da analise'
        ]
      },
      {
        title: '3. Como transformar isso em decisao',
        prompt: 'Conectar a simulacao com a escolha que a pessoa precisa fazer.'
      }
    ]
  },
  {
    slug: 'decisao-financeira-familia',
    category: 'Familia',
    title: 'Como tomar uma decisao financeira em casal sem cada conversa parecer uma disputa',
    excerpt:
      'Template para um artigo sobre alinhamento, trade-offs e como conversar sobre dinheiro com mais clareza.',
    readTime: '7 min',
    stage: 'Topo de funil',
    audience: 'Casais e familias que precisam decidir juntos sem perder contexto',
    ctaLabel: 'Abrir decisoes',
    ctaPath: '/decisions',
    heroPrompt:
      'Introduzir o conflito comum, mostrar empatia e prometer um caminho estruturado de conversa.',
    summaryPrompt:
      'Explicar rapidamente por que o problema nao e so emocional, mas tambem de falta de estrutura de decisao.',
    takeaways: [
      'Como nomear a decisao sem acusacao',
      'Como comparar opcoes sem virar debate infinito',
      'Como registrar criterio e proximo passo'
    ],
    sections: [
      {
        title: '1. Onde a conversa normalmente trava',
        prompt: 'Descrever os padroes de conflito e a origem da falta de clareza.'
      },
      {
        title: '2. Um framework simples para comparar caminhos',
        prompt: 'Explicar como organizar alternativas, criterios e impacto esperado.'
      },
      {
        title: '3. Como sair da conversa com uma decisao concreta',
        prompt: 'Mostrar como sintetizar escolha, prazo e revisao futura.'
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
    audience: 'Quem esta avaliando quitar agora, parcelar ou buscar uma alternativa intermediaria',
    ctaLabel: 'Abrir playbook',
    ctaPath: '/app/blog/playbooks/pay-now-or-installments',
    heroPrompt:
      'Abrir com a tensao entre pagar menos e preservar caixa, sem cair em resposta simplista.',
    summaryPrompt:
      'Explicar como o artigo ajuda a comparar custo total, pressao mensal e seguranca operacional.',
    takeaways: [
      'Quando o desconto a vista compensa',
      'Quando o parcelamento protege o caixa',
      'Como comparar previsibilidade com custo final'
    ],
    sections: [
      {
        title: '1. O erro de olhar so o valor da parcela',
        prompt: 'Mostrar por que parcela pequena pode esconder um custo ruim.'
      },
      {
        title: '2. Como comparar as opcoes na pratica',
        prompt: 'Descrever quais numeros e sinais precisam entrar na comparacao.',
        bullets: ['Custo final', 'Impacto no caixa do mes', 'Folga operacional', 'Risco de receita']
      },
      {
        title: '3. Como decidir com simulacao',
        prompt: 'Fechar conectando o conteudo ao playbook ou fluxo do produto.'
      }
    ]
  }
]

export const featuredBlogTemplateSlug = 'vale-parcelar-ou-pagar-agora'

export const getBlogTemplateEntry = (slug: string) =>
  blogTemplateEntries.find((entry) => entry.slug === slug) || null
