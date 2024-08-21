import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/incomes`

export default {
  getAll() {
    return axiosInterceptor.get(API_URL)
  },
  get(id) {
    return axiosInterceptor.get(`${API_URL}/${id}`)
  },
  create(data) {
    return axiosInterceptor.post(API_URL, data)
  },
  update(id, data) {
    return axiosInterceptor.put(`${API_URL}/${id}`, data)
  },
  delete(id) {
    return axiosInterceptor.delete(`${API_URL}/${id}`)
  },
  fetchMonthlyIncomes(monthNumber) {
    return axiosInterceptor.get(`${API_URL}/monthly?month=${monthNumber}`)
  },
  toggleRecurring(id) {
    return axiosInterceptor.put(`${API_URL}/${id}/toggle-recurring`)
  }
}
