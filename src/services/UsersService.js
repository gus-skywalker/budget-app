import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/users`

export default {
  fetchUsers() {
    return axiosInterceptor.get(`${API_URL}`)
  },
  notifyUser(userId, expense) {
    return axiosInterceptor.put(`${API_URL}/${userId}`, expense)
  },
  userTokenInfo() {
    return axiosInterceptor.get(`${API_URL}/userinfo`)
  }
}
