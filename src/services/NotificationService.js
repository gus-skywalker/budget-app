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
  sendEmail(data) {
    return axiosInterceptor.post(`${API_URL}/sendEmail/html`, data)
  },
  sendEmailWithAttachment(request) {
    return axiosInterceptor.post(`${API_URL}/sendEmail/attachment`, request)
  }
}
