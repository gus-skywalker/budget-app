import axiosInterceptor from './axiosInterceptor'

const FINANCIAL_GOALS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/financial-goals`

export default {
  // Busca todas as metas financeiras com campos calculados
  fetchFinancialGoals() {
    return axiosInterceptor.get(`${FINANCIAL_GOALS_API_URL}`)
  },

  // Cria uma nova meta financeira
  createFinancialGoal(goalData) {
    return axiosInterceptor.post(`${FINANCIAL_GOALS_API_URL}`, goalData)
  },

  // Atualiza uma meta financeira existente
  updateFinancialGoal(id, goalData) {
    return axiosInterceptor.put(`${FINANCIAL_GOALS_API_URL}/${id}`, goalData)
  },

  // Remove uma meta financeira
  deleteFinancialGoal(id) {
    return axiosInterceptor.delete(`${FINANCIAL_GOALS_API_URL}/${id}`)
  },

  // Adiciona uma contribuição a uma meta específica
  addContribution(goalId, contributionData) {
    return axiosInterceptor.post(
      `${FINANCIAL_GOALS_API_URL}/${goalId}/contributions`,
      contributionData
    )
  },

  // Deleta uma contribuição específica de uma meta
  deleteContribution(goalId, contributionId) {
    return axiosInterceptor.delete(
      `${FINANCIAL_GOALS_API_URL}/${goalId}/contributions/${contributionId}`
    )
  },

  // Sugerir metas baseadas na renda
  suggestGoalsBasedOnIncome(overview) {
    return axiosInterceptor.post(`${FINANCIAL_GOALS_API_URL}/suggest-goals`, overview)
  }
}
