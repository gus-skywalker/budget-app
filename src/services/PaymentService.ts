import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_PAYMENT_URL}/subscription`

export default {
  createSubscription(customerRequest: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/create-subscription`, customerRequest)
  },
  createCheckoutSession(customerRequest: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/create-checkout-session`, customerRequest)
  },
  openBillingPortal(customerRequest: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/create-portal-session`, customerRequest)
  },
  updatePlan(selectedPlan: string): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/update-plan`, {
      plan: selectedPlan
    })
  },
  loadSubscriptionDetails(userId: string): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/${userId}`)
  },
  cancelSubscription(subscriptionId: string): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/cancel-subscription/${subscriptionId}`)
  }
}
