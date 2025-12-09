import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/nubank`

export default {
  authenticateNubank(data: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/authenticate`, data)
  },
  requestCode(data: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/request-code`, data)
  },
  exchangeCertificate(data: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/exchange-cert`, data)
  },
  fetchMonthlyNubankBill(month: number, year: number): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/nubank-bills/getMonthlyExpenses/${year}/${month}`)
  }
}
