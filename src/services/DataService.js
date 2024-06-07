import axiosInterceptor from './axiosInterceptor'

const API_URL = 'http://localhost:8080/api'

export default {
  getAll() {
    return axiosInterceptor.get(API_URL)
  },
  fetchCategories(language) {
    return axiosInterceptor.get(`${API_URL}/categories/translated`, {
      params: {
        lang: language
      }
    })
  },
  fetchPaymentMethods(language) {
    return axiosInterceptor.get(`${API_URL}/payment-methods/translated`, {
      params: {
        lang: language
      }
    })
  },
  fetchMonthlyNubankBill(year, month) {
    return axiosInterceptor.get(`${API_URL}/nubank-bills/getMonthlyExpenses/${year}/${month}`)
  }
}
