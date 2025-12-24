import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_AUTH_URL}/auth`

export default {
  userTokenInfo(): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/userinfo`)
  },

  refreshToken(refreshToken: string): Promise<any> {
    // Adjust payload/endpoint if your backend expects a different format
    return axiosInterceptor.post(`${API_URL}/refresh`, {
      refresh_token: refreshToken
    })
  }
}
