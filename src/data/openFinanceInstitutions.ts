export interface OpenFinanceInstitutionOption {
  bankCode: string
  institutionKey: string
  institutionName: string
  supportsPf: boolean
  supportsPj: boolean
  logoKey?: string
  logoWarning?: string
  warning?: string
}

const missingLogoWarning = 'Logo ainda não curado; usando generic-bank.svg temporariamente.'

export const openFinanceInstitutions: OpenFinanceInstitutionOption[] = [
  { institutionKey: 'itau', institutionName: 'Itaú', bankCode: '341', supportsPf: true, supportsPj: true },
  { institutionKey: 'bradesco', institutionName: 'Bradesco', bankCode: '237', supportsPf: true, supportsPj: true },
  { institutionKey: 'caixa', institutionName: 'Caixa', bankCode: '104', supportsPf: true, supportsPj: true },
  { institutionKey: 'santander', institutionName: 'Santander', bankCode: '033', supportsPf: true, supportsPj: true },
  { institutionKey: 'banco-do-brasil', institutionName: 'Banco do Brasil', bankCode: '001', supportsPf: true, supportsPj: true },
  { institutionKey: 'nubank', institutionName: 'Nubank', bankCode: '260', supportsPf: true, supportsPj: true },
  { institutionKey: 'btg-pactual', institutionName: 'BTG Pactual', bankCode: '208', supportsPf: true, supportsPj: true },
  { institutionKey: 'sicredi', institutionName: 'Sicredi', bankCode: '748', supportsPf: true, supportsPj: true },
  { institutionKey: 'sicoob', institutionName: 'Sicoob', bankCode: '756', supportsPf: true, supportsPj: true },
  { institutionKey: 'banrisul', institutionName: 'Banrisul', bankCode: '041', supportsPf: true, supportsPj: true },
  { institutionKey: 'mercado-pago', institutionName: 'Mercado Pago', bankCode: '323', supportsPf: true, supportsPj: true },
  { institutionKey: 'bmg', institutionName: 'BMG', bankCode: '318', supportsPf: true, supportsPj: true },
  { institutionKey: 'unicred', institutionName: 'Unicred', bankCode: '136', supportsPf: true, supportsPj: true },
  { institutionKey: 'xp-banking', institutionName: 'XP Banking', bankCode: '348', supportsPf: true, supportsPj: true },
  { institutionKey: 'next', institutionName: 'Next', bankCode: '237', supportsPf: true, supportsPj: true, warning: 'Conta digital do Bradesco.' },
  { institutionKey: 'picpay', institutionName: 'PicPay', bankCode: '380', supportsPf: true, supportsPj: true },
  { institutionKey: 'banco-pan', institutionName: 'Banco PAN', bankCode: '623', supportsPf: true, supportsPj: false, logoWarning: missingLogoWarning },
  { institutionKey: 'digio', institutionName: 'Banco Digio', bankCode: '335', supportsPf: true, supportsPj: false, logoWarning: missingLogoWarning },
  { institutionKey: 'banco-do-nordeste', institutionName: 'Banco do Nordeste', bankCode: '004', supportsPf: true, supportsPj: true },
  { institutionKey: 'uber-conta-digio', institutionName: 'Uber Conta by Digio', bankCode: '335', supportsPf: true, supportsPj: false, logoWarning: missingLogoWarning, warning: 'Parceria com o Banco Digio.' },
  { institutionKey: 'woop', institutionName: 'Woop', bankCode: '748', supportsPf: true, supportsPj: false },
  { institutionKey: 'safra', institutionName: 'Safra', bankCode: '422', supportsPf: true, supportsPj: true },
  { institutionKey: 'banco-paulista', institutionName: 'Banco Paulista', bankCode: '611', supportsPf: true, supportsPj: true },
  { institutionKey: 'safrapay', institutionName: 'SafraPay', bankCode: '422', supportsPf: true, supportsPj: true, warning: 'Solução de pagamentos do Banco Safra.' },
  { institutionKey: 'citi', institutionName: 'Citi', bankCode: '745', supportsPf: false, supportsPj: true, logoWarning: missingLogoWarning },
  { institutionKey: 'safra-financeira', institutionName: 'Safra Financeira', bankCode: '422', supportsPf: true, supportsPj: true, warning: 'Financeira do grupo Safra.' },
  { institutionKey: 'sofisa', institutionName: 'Banco Sofisa', bankCode: '637', supportsPf: true, supportsPj: true },
  { institutionKey: 'bv', institutionName: 'Banco BV', bankCode: '655', supportsPf: true, supportsPj: true },
  { institutionKey: 'meliuz', institutionName: 'Méliuz', bankCode: '000', supportsPf: true, supportsPj: false, logoWarning: missingLogoWarning, warning: 'Não possui código próprio. Informar 000.' },
  { institutionKey: 'infinitepay', institutionName: 'InfinitePay', bankCode: '000', supportsPf: true, supportsPj: true, warning: 'Não possui código próprio. Informar 000.' },
  { institutionKey: 'caixa-tem', institutionName: 'Caixa Tem', bankCode: '104', supportsPf: true, supportsPj: false, warning: 'Conta poupança digital da Caixa.' },
  { institutionKey: 'necton', institutionName: 'Necton', bankCode: '208', supportsPf: true, supportsPj: false, warning: 'Corretora do BTG.' },
  { institutionKey: 'recargapay', institutionName: 'RecargaPay', bankCode: '301', supportsPf: true, supportsPj: true, warning: 'Utiliza o BPP como banco liquidante.' },
  { institutionKey: 'stone', institutionName: 'Stone Pagamentos', bankCode: '197', supportsPf: true, supportsPj: true },
  { institutionKey: 'itau-bba', institutionName: 'Itaú BBA', bankCode: '184', supportsPf: false, supportsPj: true, warning: 'Banco de investimento do grupo Itaú.' },
  { institutionKey: 'porto-bank', institutionName: 'Porto Bank', bankCode: '724', supportsPf: true, supportsPj: false, logoWarning: missingLogoWarning },
  { institutionKey: 'neon', institutionName: 'Neon', bankCode: '536', supportsPf: true, supportsPj: false },
  { institutionKey: 'celcoin', institutionName: 'Rede Celcoin', bankCode: '000', supportsPf: true, supportsPj: true, logoWarning: missingLogoWarning, warning: 'Não possui código próprio. Informar 000.' },
  { institutionKey: 'pagueveloz', institutionName: 'PagueVeloz (Serasa)', bankCode: '000', supportsPf: true, supportsPj: true, logoWarning: missingLogoWarning, warning: 'Não possui código próprio. Informar 000.' },
  { institutionKey: 'itau-empresas', institutionName: 'Itaú Empresas', bankCode: '341', supportsPf: false, supportsPj: true },
  { institutionKey: 'c6-bank', institutionName: 'C6 Bank', bankCode: '336', supportsPf: true, supportsPj: true },
  { institutionKey: 'pagbank', institutionName: 'PagBank', bankCode: '290', supportsPf: true, supportsPj: true },
  { institutionKey: 'inter', institutionName: 'Inter', bankCode: '077', supportsPf: true, supportsPj: true },
  { institutionKey: 'midway', institutionName: 'Midway', bankCode: '000', supportsPf: true, supportsPj: false, logoWarning: missingLogoWarning, warning: 'Não possui código próprio. Informar 000.' },
  { institutionKey: 'brb', institutionName: 'BRB', bankCode: '070', supportsPf: true, supportsPj: true },
  { institutionKey: 'mercantil', institutionName: 'Banco Mercantil', bankCode: '389', supportsPf: true, supportsPj: true },
]

export const genericBankLogo = '/bank-logos/generic-bank.svg'

export const bankLogoMap: Record<string, string> = {
  '000-infinitepay': '/bank-logos/000-infinitepay.svg',
  '001': '/bank-logos/001.svg',
  '004': '/bank-logos/004.svg',
  '033': '/bank-logos/033.svg',
  '041': '/bank-logos/041.svg',
  '070': '/bank-logos/070.svg',
  '077': '/bank-logos/077.svg',
  '104': '/bank-logos/104.svg',
  '136': '/bank-logos/136.svg',
  '184': '/bank-logos/184.svg',
  '197': '/bank-logos/197.svg',
  '208': '/bank-logos/208.svg',
  '237': '/bank-logos/237.svg',
  '260': '/bank-logos/260.svg',
  '290': '/bank-logos/290.svg',
  '301': '/bank-logos/301.svg',
  '318': '/bank-logos/318.svg',
  '323': '/bank-logos/323.svg',
  '336': '/bank-logos/336.svg',
  '341': '/bank-logos/341.svg',
  '348': '/bank-logos/348.svg',
  '380': '/bank-logos/380.svg',
  '389': '/bank-logos/389.svg',
  '422': '/bank-logos/422.svg',
  '536': '/bank-logos/536.svg',
  '611': '/bank-logos/611.svg',
  '637': '/bank-logos/637.svg',
  '655': '/bank-logos/655.svg',
  '748': '/bank-logos/748.svg',
  '756': '/bank-logos/756.svg',
  'caixa-tem': '/bank-logos/caixa-tem.svg',
  'itau-bba': '/bank-logos/itau-bba.svg',
  'itau-emps': '/bank-logos/itau-emps.svg',
  'itau-empresas': '/bank-logos/itau-empresas.svg',
  'necton': '/bank-logos/necton.svg',
  'next': '/bank-logos/next.svg',
  'pagbank': '/bank-logos/pagbank.svg',
  'safra-financeira': '/bank-logos/safra-financeira.svg',
  'safrapay': '/bank-logos/safrapay.svg',
  'woop': '/bank-logos/woop.svg',
}

const institutionLogoAliases: Record<string, string> = {
  'banco bmg': '318',
  'banco do brasil': '001',
  'banco inter': '077',
  'banco mercantil': '389',
  'banco mercantil do brasil': '389',
  'banco nordeste': '004',
  'banco paulista': '611',
  'banco safra': '422',
  'banco santander': '033',
  'banco sofisa': '637',
  'banco bv': '655',
  'banco votorantim': '655',
  'banco-do-brasil': '001',
  'banco-do-nordeste': '004',
  'banco-paulista': '611',
  banrisul: '041',
  bmg: '318',
  bradesco: '237',
  brb: '070',
  btg: '208',
  'btg pactual': '208',
  caixa: '104',
  'caixa economica federal': '104',
  'caixa tem': 'caixa-tem',
  'caixa-tem': 'caixa-tem',
  inter: '077',
  itau: '341',
  'itau bba': 'itau-bba',
  'itau-bba': 'itau-bba',
  'itau empresas': 'itau-empresas',
  'itau-empresas': 'itau-empresas',
  infinitepay: '000-infinitepay',
  'mercado pago': '323',
  'mercado-pago': '323',
  neon: '536',
  necton: 'necton',
  next: 'next',
  nubank: '260',
  pagbank: 'pagbank',
  pagseguro: '290',
  picpay: '380',
  recargapay: '301',
  safra: '422',
  'safra financeira': 'safra-financeira',
  'safra-financeira': 'safra-financeira',
  safrapay: 'safrapay',
  santander: '033',
  sicoob: '756',
  sicredi: '748',
  sofisa: '637',
  stone: '197',
  'stone pagamentos': '197',
  unicred: '136',
  woop: 'woop',
  xp: '348',
  'xp banking': '348',
  'xp-banking': '348',
  'btg-pactual': '208',
  'c6-bank': '336',
}

const normalizeLogoKey = (value?: string | null) => (
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
)

const logoPathForAlias = (value?: string | null) => {
  const normalized = normalizeLogoKey(value)
  if (!normalized) return ''
  const alias = institutionLogoAliases[normalized]
  return alias ? bankLogoMap[alias] || '' : ''
}

export const bankLogoPath = (bankCode?: string | null, institutionKey?: string | null, institutionName?: string | null) => {
  const normalizedCode = String(bankCode || '').trim()
  if (normalizedCode && bankLogoMap[normalizedCode]) {
    return bankLogoMap[normalizedCode]
  }

  const logoByKey = logoPathForAlias(institutionKey)
  if (logoByKey) return logoByKey

  const logoByName = logoPathForAlias(institutionName)
  if (logoByName) return logoByName

  return genericBankLogo
}
