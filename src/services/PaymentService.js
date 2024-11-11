import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_PAYMENT_URL}/api/subscription`

export default {
  createCheckoutSession(priceId) {
    return axiosInterceptor.post(`${API_URL}/create-checkout-session`, { plan: priceId })
  },

  openBillingPortal() {
    return axiosInterceptor.post(`${API_URL}/create-portal-session`)
  },

  updatePlan(selectedPlan) {
    return axiosInterceptor.post(`${API_URL}/update-plan`, {
      plan: selectedPlan
    })
  },

  loadSubscriptionDetails() {
    return axiosInterceptor.get(`${API_URL}/details`)
  },

  cancelSubscription() {
    return axiosInterceptor.post(`${API_URL}/cancel`)
  }
}
