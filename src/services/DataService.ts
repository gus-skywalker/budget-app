import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}`

export default {
  getAll(): Promise<any> {
    return axiosInterceptor.get(API_URL)
  },
  fetchCategories(language: string): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/categories/translated`, {
      params: {
        lang: language
      }
    })
  },
  fetchPaymentMethods(language: string): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/payment-methods/translated`, {
      params: {
        lang: language
      }
    })
  },
  fetchChartData(timePeriod: string, category: string): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/dashboard/chart`, {
      params: {
        timePeriod: timePeriod,
        category: category
      }
    })
  },
  fetchMonthOverview(): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/dashboard/overview`)
  }
}
