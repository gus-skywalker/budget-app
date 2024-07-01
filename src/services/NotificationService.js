import axiosInterceptor from './axiosInterceptor'

const API_URL = 'http://localhost:8080/api/notifications'

export default {
  accept(notificationId) {
    return axiosInterceptor.put(`${API_URL}/${notificationId}/accept`)
  },
  decline(notificationId) {
    return axiosInterceptor.put(`${API_URL}/${notificationId}/decline`)
  },
  getNotifications() {
    return axiosInterceptor.get(`${API_URL}`)
  }
}
