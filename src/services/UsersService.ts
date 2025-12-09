import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/users`

export default {
  fetchUsers(): Promise<any> {
    return axiosInterceptor.get(`${API_URL}`)
  },
  notifyUser(userId: string, expense: any): Promise<any> {
    return axiosInterceptor.put(`${API_URL}/${userId}`, expense)
  }
}
