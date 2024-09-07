import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}`

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
  fetchChartData(timePeriod, category) {
    return axiosInterceptor.get(`${API_URL}/dashboard/chart`, {
      params: {
        timePeriod: timePeriod,
        category: category
      }
    })
  }
}
