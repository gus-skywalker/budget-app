import axios from 'axios'
import axiosInterceptor from './axiosInterceptor'
const AUTH_BASE_URL = String(import.meta.env.VITE_AUTH_URL || '').replace(/\/+$/, '')
const API_URL = `${AUTH_BASE_URL}/api/auth`

export default {
  signIn(payload: { email: string; password: string }): Promise<any> {
    return axios.post(`${API_URL}/signin`, payload, { withCredentials: true })
  },

  signUp(payload: { username: string; email: string; password: string; language?: string }): Promise<any> {
    return axios.post(`${API_URL}/signup`, payload, { withCredentials: true })
  },

  reactivate(payload: { username?: string; email: string; password: string }): Promise<any> {
    return axios.post(`${API_URL}/reactivate`, payload, { withCredentials: true })
  },

  forgotPassword(email: string): Promise<any> {
    return axios.post(`${API_URL}/forgot-password`, { email })
  },

  resetPassword(token: string, newPassword: string): Promise<any> {
    return axios.post(`${API_URL}/reset-password`, { token, newPassword })
  },

  verifyEmail(token: string): Promise<any> {
    return axios.post(`${API_URL}/verify-email`, null, { params: { token } })
  },

  resendVerification(email?: string): Promise<any> {
    return axios.post(`${API_URL}/resend-verification`, email ? { email } : {})
  },

  changePassword(currentPassword: string, newPassword: string): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/change-password`, { currentPassword, newPassword })
  },

  getUserInfo(): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/userinfo`)
  },

  updateUser(userId: string, payload: { username?: string; email?: string; language?: string }): Promise<any> {
    return axiosInterceptor.put(`${API_URL}/${userId}`, payload)
  },

  deleteUser(userId: string): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/${userId}`)
  },

  userTokenInfo(): Promise<any> {
    return this.getUserInfo()
  },

  refreshToken(): Promise<any> {
    // Usa axios direto para não passar pelo interceptor e evitar loops de refresh
    return axios.post(`${API_URL}/refresh`, {}, { withCredentials: true })
  },

  bootstrapSession(): Promise<any> {
    return axios.post(`${API_URL}/session/bootstrap`, {}, { withCredentials: true })
  },

  logout(): Promise<any> {
    // Usa axios direto para invalidar a sessao mesmo quando o access token expirou.
    return axios.post(`${API_URL}/logout`, {}, { withCredentials: true })
  },

  getOAuthAuthorizationUrl(provider: 'google' | 'github'): string {
    return `${AUTH_BASE_URL}/oauth2/authorization/${provider}`
  }
}
