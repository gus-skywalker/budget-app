import axiosInterceptor from './axiosInterceptor'
import { getApiLanguage } from '@/utils/languageUtils'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}`

export default {
  getAll(): Promise<any> {
    return axiosInterceptor.get(API_URL)
  },
  
  /**
   * Busca categorias traduzidas
   * @param language - Idioma do usuário em UPPERCASE (PT, EN, FR) ou lowercase (pt, en, fr)
   */
  fetchCategories(language: string): Promise<any> {
    const apiLang = getApiLanguage(language)
    return axiosInterceptor.get(`${API_URL}/categories/translated`, {
      params: {
        lang: apiLang
      }
    })
  },
  
  /**
   * Busca métodos de pagamento traduzidos
   * @param language - Idioma do usuário em UPPERCASE (PT, EN, FR) ou lowercase (pt, en, fr)
   */
  fetchPaymentMethods(language: string): Promise<any> {
    const apiLang = getApiLanguage(language)
    return axiosInterceptor.get(`${API_URL}/payment-methods/translated`, {
      params: {
        lang: apiLang
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
