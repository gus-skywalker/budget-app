import axiosInterceptor from './axiosInterceptor'
import { getApiLanguage } from '@/utils/languageUtils'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}`

export interface CategoryUpsertPayload {
  code: string
  name: string
  type?: 'EXPENSE' | 'INCOME'
  parentCategoryId?: number | null
  displayColor?: string | null
  displayIcon?: string | null
}

export interface TagUpsertPayload {
  name: string
  displayColor?: string | null
}

export interface CategoryAutomationUpsertPayload {
  name: string
  matchOperator?: 'CONTAINS' | 'EXACT'
  matchValue: string
  targetCategoryId: number
  overwriteExistingCategory?: boolean
}

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

  listCategories(): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/categories`)
  },

  createCategory(payload: CategoryUpsertPayload): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/categories`, payload)
  },

  updateCategory(id: number, payload: CategoryUpsertPayload): Promise<any> {
    return axiosInterceptor.put(`${API_URL}/categories/${id}`, payload)
  },

  deactivateCategory(id: number): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/categories/${id}`)
  },

  listTags(): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/tags`)
  },

  createTag(payload: TagUpsertPayload): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/tags`, payload)
  },

  updateTag(id: number, payload: TagUpsertPayload): Promise<any> {
    return axiosInterceptor.put(`${API_URL}/tags/${id}`, payload)
  },

  deactivateTag(id: number): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/tags/${id}`)
  },

  listCategoryAutomations(): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/category-automations`)
  },

  createCategoryAutomation(payload: CategoryAutomationUpsertPayload): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/category-automations`, payload)
  },

  updateCategoryAutomation(id: number, payload: CategoryAutomationUpsertPayload): Promise<any> {
    return axiosInterceptor.put(`${API_URL}/category-automations/${id}`, payload)
  },

  deactivateCategoryAutomation(id: number): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/category-automations/${id}`)
  },

  applyCategoryAutomation(id: number): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/category-automations/${id}/apply`, {})
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
