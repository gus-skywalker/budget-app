import axiosInterceptor from './axiosInterceptor'

const FINANCIAL_GOALS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/financial-goals`

export default {
  fetchFinancialGoals(): Promise<any> {
    return axiosInterceptor.get(`${FINANCIAL_GOALS_API_URL}`)
  },
  createFinancialGoal(goalData: any): Promise<any> {
    return axiosInterceptor.post(`${FINANCIAL_GOALS_API_URL}`, goalData)
  },
  updateFinancialGoal(id: string, goalData: any): Promise<any> {
    return axiosInterceptor.put(`${FINANCIAL_GOALS_API_URL}/${id}`, goalData)
  },
  deleteFinancialGoal(id: string): Promise<any> {
    return axiosInterceptor.delete(`${FINANCIAL_GOALS_API_URL}/${id}`)
  },
  addContribution(goalId: string, contributionData: any): Promise<any> {
    return axiosInterceptor.post(`${FINANCIAL_GOALS_API_URL}/${goalId}/contributions`, contributionData)
  },
  deleteContribution(goalId: string, contributionId: string): Promise<any> {
    return axiosInterceptor.delete(`${FINANCIAL_GOALS_API_URL}/${goalId}/contributions/${contributionId}`)
  }
}
