import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_PAYMENT_URL}/subscription`

export default {
  createSubscription(customerRequest) {
    return axiosInterceptor.post(`${API_URL}/create-subscription`, customerRequest)
  },

  createCheckoutSession(customerRequest) {
    return axiosInterceptor.post(`${API_URL}/create-checkout-session`, customerRequest)
  },

  openBillingPortal(customerRequest) {
    return axiosInterceptor.post(`${API_URL}/create-portal-session`, customerRequest)
  },

  updatePlan(selectedPlan) {
    return axiosInterceptor.post(`${API_URL}/update-plan`, {
      plan: selectedPlan
    })
  },

  loadSubscriptionDetails(userId) {
    return axiosInterceptor.get(`${API_URL}/${userId}`)
  },

  cancelSubscription(subscriptionId) {
    return axiosInterceptor.delete(`${API_URL}/cancel-subscription/${subscriptionId}`)
  }
}
