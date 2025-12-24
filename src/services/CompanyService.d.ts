// src/services/CompanyService.d.ts
export interface Company {
  companyId: string
  companyName: string
  role?: string | null
}

export interface CreateCompanyResponse {
  message: string
  companyId: string
  companyName: string
}

export interface SelectCompanyResponse {
  message?: string
  accessToken: string
  refreshToken: string
  companyId?: string | null
  tenantRole?: string | null
}

declare const CompanyService: {
  create(companyName: string, description?: string): Promise<{ data: CreateCompanyResponse }>
  getAll(): Promise<{ data: Company[] }>
  getDetails(companyId: string): Promise<{ data: any }>
  update(companyId: string, payload: { companyName?: string; description?: string }): Promise<{ data: any }>
  listMembers(companyId: string): Promise<{ data: any[] }>
  selectCompany(companyId: string): Promise<{ data: SelectCompanyResponse }>
  clearCompany(): Promise<{ data: SelectCompanyResponse }>
  deleteCompany(companyId: string): Promise<{ data: { message: string } }>
}

export default CompanyService
