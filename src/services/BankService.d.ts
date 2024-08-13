// nubankService.d.ts

declare module '@/services/BankService' {
  // Definição das interfaces para os dados das requisições
  export interface AuthenticateNubankData {
    cpf: string
    password: string
  }

  export interface ExchangeCertificateData {
    code: string
    cpf: string
    session_id: string
  }

  export interface FetchMonthlyNubankBillParams {
    month: number
    year: number
  }

  // Definição das funções exportadas
  export function authenticateNubank(data: AuthenticateNubankData): Promise<any>

  export function requestCode(data: AuthenticateNubankData): Promise<any>

  export function exchangeCertificate(data: ExchangeCertificateData): Promise<any>

  export function fetchMonthlyNubankBill(params: FetchMonthlyNubankBillParams): Promise<any>
}
