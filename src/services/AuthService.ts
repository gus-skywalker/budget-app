import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_AUTH_URL}/auth`

export default {
  userTokenInfo(): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/userinfo`)
  }
}
