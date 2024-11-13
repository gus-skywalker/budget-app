import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_PAYMENT_URL}/subscription`

export default {
  createSubscription(customerRequest) {
    return axiosInterceptor.post(`${API_URL}/create-subscription`, customerRequest)
  },

  createCheckoutSession(customerRequest) {
    return axiosInterceptor.post(`${API_URL}/create-checkout-session`, customerRequest)
  },

  openBillingPortal(customerId) {
    return axiosInterceptor.post(`${API_URL}/create-portal-session`, { customerId: customerId })
  },

  updatePlan(selectedPlan) {
    return axiosInterceptor.post(`${API_URL}/update-plan`, {
      plan: selectedPlan
    })
  },

  loadSubscriptionDetails(userId) {
    return axiosInterceptor.get(`${API_URL}/${userId}`)
  },

  cancelSubscription() {
    return axiosInterceptor.post(`${API_URL}/cancel`)
  }
}
