import axiosInterceptor from './axiosInterceptor'

const NUBANK_API_URL = `${import.meta.env.VITE_API_BASE_URL}/nubank`
const NUBANK_BILLS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/nubank-bills`

export default {
  authenticateNubank(data: any): Promise<any> {
    return axiosInterceptor.post(`${NUBANK_API_URL}/authenticate`, data)
  },
  requestCode(data: any): Promise<any> {
    return axiosInterceptor.post(`${NUBANK_API_URL}/request-code`, data)
  },
  exchangeCertificate(data: any): Promise<any> {
    return axiosInterceptor.post(`${NUBANK_API_URL}/exchange-cert`, data)
  },
  fetchMonthlyNubankBill(month: number, year: number): Promise<any> {
    return axiosInterceptor.get(`${NUBANK_BILLS_API_URL}/getMonthlyExpenses/${year}/${month}`)
  }
}
