import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/financial-goals`

export default {
  // Busca todas as metas financeiras com campos calculados
  fetchFinancialGoals() {
    return axiosInterceptor.get(`${API_URL}`)
  },

  // Cria uma nova meta financeira
  createFinancialGoal(goalData) {
    return axiosInterceptor.post(`${API_URL}`, goalData)
  },

  // Atualiza uma meta financeira existente
  updateFinancialGoal(id, goalData) {
    return axiosInterceptor.put(`${API_URL}/${id}`, goalData)
  },

  // Remove uma meta financeira
  deleteFinancialGoal(id) {
    return axiosInterceptor.delete(`${API_URL}/${id}`)
  },

  // Adiciona uma contribuição
  addContribution(contributionData) {
    return axiosInterceptor.post(
      `${import.meta.env.VITE_API_BASE_URL}/contributions`,
      contributionData
    )
  },

  // Deleta uma contribuição específica
  deleteContribution(contributionId) {
    return axiosInterceptor.delete(
      `${import.meta.env.VITE_API_BASE_URL}/contributions/${contributionId}`
    )
  },

  // Sugerir metas baseadas na renda
  suggestGoalsBasedOnIncome(overview) {
    return axiosInterceptor.post(`${API_URL}/suggest-goals`, overview)
  }
}
