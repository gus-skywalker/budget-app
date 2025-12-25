import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_PAYMENT_URL}/subscription`

export default {
  /**
   * Cria assinatura (pessoal ou empresarial)
   * Pessoal: { userId, ... }
   * Empresarial: { companyId, subscriptionTarget: 'COMPANY', ... }
   */
  createSubscription(payload: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/create-subscription`, payload)
  },

  /**
   * Cria sessão de checkout (pessoal ou empresarial)
   * Pessoal: { userId, ... }
   * Empresarial: { companyId, subscriptionTarget: 'COMPANY', ... }
   */
  createCheckoutSession(payload: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/create-checkout-session`, payload)
  },

  /**
   * Abre portal de billing (Stripe)
   * Body: { customerId }
   */
  openBillingPortal(payload: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/create-portal-session`, payload)
  },

  /**
   * Consulta assinatura pessoal por userId
   */
  loadSubscriptionDetails(userId: string): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/${userId}`)
  },

  /**
   * Consulta assinatura empresarial por companyId
   */
  loadCompanySubscriptionDetails(companyId: string): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/company/${companyId}`)
  },

  /**
   * Cancela assinatura (pessoal ou empresarial)
   */
  cancelSubscription(subscriptionId: string): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/cancel-subscription/${subscriptionId}`)
  }
}
