import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/incomes`

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
  update(id: string, data: any): Promise<any> {
    return axiosInterceptor.put(`${API_URL}/${id}`, data)
  },
  delete(id: string): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/${id}`)
  },
  fetchMonthlyIncomes(month: number, year: number): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/date?month=${month}&year=${year}`)
  },
  toggleRecurring(id: string, months: number): Promise<any> {
    return axiosInterceptor.put(`${API_URL}/${id}/${months}/toggle-recurring`)
  }
}
