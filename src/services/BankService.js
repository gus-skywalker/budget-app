import axiosInterceptor from './axiosInterceptor'

const API_URL = 'http://localhost:8080/api/nubank'

export default {
  authenticateNubank(data) {
    return axiosInterceptor.post(`${API_URL}/authenticate`, data)
  },
  requestCode(data) {
    return axiosInterceptor.post(`${API_URL}/request-code`, data)
  },
  exchangeCertificate(data) {
    return axiosInterceptor.post(`${API_URL}/exchange-cert`, data)
  },
  fetchMonthlyNubankBill(month, year) {
    return axiosInterceptor.get(`${API_URL}/nubank-bills/getMonthlyExpenses/${year}/${month}`)
  }
}
