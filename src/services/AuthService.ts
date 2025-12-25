import axios from 'axios'
import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_AUTH_URL}/auth`

export default {
  userTokenInfo(): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/userinfo`)
  },

  refreshToken(refreshToken: string): Promise<any> {
    // Usa axios direto para não passar pelo interceptor e evitar loops de refresh
    return axios.post(`${API_URL}/refresh`, {
      refresh_token: refreshToken
    }, {
      withCredentials: true
    })
  }
}
