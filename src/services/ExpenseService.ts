import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/expenses`

export default {
  getAll(): Promise<any> {
    return axiosInterceptor.get(API_URL)
  },
  get(id: string): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/${id}`)
  },
  create(data: any): Promise<any> {
    return axiosInterceptor.post(API_URL, data)
  },
  uploadAttachment(expenseId: string, formData: FormData): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/${expenseId}/attachment`, formData)
  },
  removeAttachment(expenseId: string, attachmentId: string): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/${expenseId}/attachment/${attachmentId}`)
  },
  update(id: string, data: any): Promise<any> {
    return axiosInterceptor.put(`${API_URL}/${id}`, data)
  },
  delete(id: string): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/${id}`)
  },
  fetchMonthlyExpenses(monthNumber: number, year: number): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/monthly?year=${year}&month=${monthNumber}`)
  }
}
