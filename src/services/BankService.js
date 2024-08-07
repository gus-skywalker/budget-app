import axiosInterceptor from './axiosInterceptor'

const API_URL = 'http://localhost:8080/api'

export default {
  authenticateNubank(data) {
    return axiosInterceptor.post(`${API_URL}/nubank/authenticate`, data)
  },
  generateNubankCert(data) {
    return axiosInterceptor.post(`${API_URL}/nubank/generate-cert`, data)
  },
  fetchMonthlyNubankBill(month, year) {
    return axiosInterceptor.get(`${API_URL}/nubank-bills/getMonthlyExpenses/${year}/${month}`)
  }
}
