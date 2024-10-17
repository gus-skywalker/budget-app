import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}`

export default {
  // Busca todas as metas financeiras
  fetchFinancialGoals() {
    return axiosInterceptor.get(`${API_URL}/financial-goals`)
  },

  // Cria uma nova meta financeira
  createFinancialGoal(goalData) {
    return axiosInterceptor.post(`${API_URL}/financial-goals`, goalData)
  },

  // Atualiza uma meta financeira existente
  updateFinancialGoal(id, goalData) {
    return axiosInterceptor.put(`${API_URL}/financial-goals/${id}`, goalData)
  },

  // Remove uma meta financeira
  deleteFinancialGoal(id) {
    return axiosInterceptor.delete(`${API_URL}/financial-goals/${id}`)
  },

  // Busca as transações do usuário
  fetchTransactions() {
    return axiosInterceptor.get(`${API_URL}/transactions`)
  },

  // Busca as contribuições de um objetivo financeiro
  fetchContributions(goalId) {
    return axiosInterceptor.get(`${API_URL}/financial-goals/${goalId}/contributions`)
  },

  // Deleta uma contribuição específica
  deleteContribution(contributionId) {
    return axiosInterceptor.delete(`${API_URL}/contributions/${contributionId}`)
  }
}
