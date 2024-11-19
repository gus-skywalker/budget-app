import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/notifications`

export default {
  getNotifications() {
    return axiosInterceptor.get(`${API_URL}`)
  },
  accept(notificationId) {
    return axiosInterceptor.put(`${API_URL}/${notificationId}/accept`)
  },
  decline(notificationId) {
    return axiosInterceptor.put(`${API_URL}/${notificationId}/decline`)
  },
  sendEmail(expenseRequest) {
    return axiosInterceptor.post(`${API_URL}/sendEmail/html`, expenseRequest)
  },
  sendEmailWithAttachment(request) {
    return axiosInterceptor.post(`${API_URL}/sendEmail/attachment`, request)
  },
  updateAlertSettings(settings) {
    return axiosInterceptor.put(`${API_URL}/alerts/settings`, settings)
  },
  getAlertSettings() {
    return axiosInterceptor.get(`${API_URL}/alerts/settings`)
  },
  scheduleExpenseAlert(expenseRequest) {
    return axiosInterceptor.post(`${API_URL}/alerts/schedule`, expenseRequest)
  }
}
