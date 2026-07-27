import axiosInterceptor from './axiosInterceptor'
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/reports`

export interface ReportCategoryAggregate {
  categoryId: number | null
  categoryCode: string | null
  categoryName: string | null
  systemDefined: boolean
  displayColor: string | null
  displayIcon: string | null
  amount: number
  transactionCount: number
}

export interface ReportAnalytics {
  fromDate: string
  toDate: string
  currency: string
  income: number
  expenses: number
  net: number
  excluded: number
  categories: ReportCategoryAggregate[]
  uncategorized: ReportCategoryAggregate | null
}

export default class ReportService {
  generate(reportType: string, format: string, reportRequest: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/${reportType}/${format}`, reportRequest, {
      responseType: 'blob'
    })
  }

  analytics(fromDate: string, toDate: string) {
    return axiosInterceptor.get<ReportAnalytics>(`${API_URL}/analytics`, {
      params: { fromDate, toDate },
    })
  }
}
