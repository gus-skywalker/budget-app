// src/services/CompanyService.d.ts
export interface Company {
  companyId: string
  companyName: string
  role: string
}

export interface CreateCompanyResponse {
  message: string
  companyId: string
  companyName: string
}

export interface SelectCompanyResponse {
  message: string
  accessToken: string
  refreshToken: string
}

declare const CompanyService: {
  create(companyName: string): Promise<{ data: CreateCompanyResponse }>
  getAll(): Promise<{ data: Company[] }>
  selectCompany(companyId: string): Promise<{ data: SelectCompanyResponse }>
}

export default CompanyService
