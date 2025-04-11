import axiosInterceptor from './axiosInterceptor'
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/reports`

export default class ReportService {
  generate(reportType, format, reportRequest) {
    return axiosInterceptor.post(`${API_URL}/${reportType}/${format}`, reportRequest, {
      responseType: 'blob'
    })
  }
}
