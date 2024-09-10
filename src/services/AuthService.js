import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_AUTH_URL}/auth`

export default {
  userTokenInfo() {
    return axiosInterceptor.get(`${API_URL}/userinfo`)
  }
}
