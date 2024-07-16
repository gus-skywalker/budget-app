import axiosInterceptor from './axiosInterceptor'

const API_URL = 'http://localhost:8080/api/users'

export default {
  fetchUsers() {
    return axiosInterceptor.get(`${API_URL}`)
  },
  notifyUser(userId, expense) {
    return axiosInterceptor.put(`${API_URL}/${userId}`, expense)
  }
}
