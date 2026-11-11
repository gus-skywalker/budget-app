import axios from 'axios'

const BRASIL_API_BASE_URL = String(import.meta.env.VITE_BRASIL_API_BASE_URL || 'https://brasilapi.com.br/api').replace(/\/+$/, '')

export interface BrasilApiCepV2Address {
  cep: string
  state: string
  city: string
  neighborhood: string | null
  street: string | null
  timezoneName: string | null
  location?: {
    type?: string
    coordinates?: {
      longitude?: string
      latitude?: string
    }
  }
}

export interface BrasilApiCnpj {
  cnpj: string
  razao_social?: string
  nome_fantasia?: string
  descricao_situacao_cadastral?: string
  situacao_cadastral?: number
  cep?: number
  uf?: string
  municipio?: string | null
  bairro?: string
  logradouro?: string
  numero?: string
  complemento?: string
  email?: string | null
}

export const onlyDigits = (value: string | null | undefined) => String(value || '').replace(/\D/g, '')

export const isValidCep = (value: string | null | undefined) => onlyDigits(value).length === 8

export const isValidCpf = (value: string | null | undefined) => {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  const calculateDigit = (base: string, weights: number[]) => {
    const sum = weights.reduce((total, weight, index) => total + Number(base[index]) * weight, 0)
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const firstDigit = calculateDigit(cpf.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const secondDigit = calculateDigit(cpf.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10])
}

export const isValidCnpj = (value: string | null | undefined) => {
  const cnpj = onlyDigits(value)
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false

  const calculateDigit = (base: string, weights: number[]) => {
    const sum = weights.reduce((total, weight, index) => total + Number(base[index]) * weight, 0)
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const firstDigit = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const secondDigit = calculateDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13])
}

const client = axios.create({
  baseURL: BRASIL_API_BASE_URL,
  timeout: 12000,
})

export default {
  async getCep(cep: string) {
    const digits = onlyDigits(cep)
    if (!isValidCep(digits)) {
      throw new Error('CEP deve conter 8 dígitos.')
    }

    return client.get<BrasilApiCepV2Address>(`/cep/v2/${digits}`)
  },

  async getCnpj(cnpj: string) {
    const digits = onlyDigits(cnpj)
    if (!isValidCnpj(digits)) {
      throw new Error('CNPJ inválido.')
    }

    return client.get<BrasilApiCnpj>(`/cnpj/v1/${digits}`)
  },
}
