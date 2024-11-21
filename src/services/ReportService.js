import axiosInterceptor from './axiosInterceptor'
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/reports`

export default class ReportService {
  generateReportPDF(reportType, reportRequest) {
    return axiosInterceptor.post(`${API_URL}/${reportType}/pdf`, reportRequest, {
      responseType: 'blob'
    })
  }

  generateReportXLSX(reportType, reportRequest) {
    return axiosInterceptor.post(`${API_URL}/${reportType}/xlsx`, reportRequest, {
      responseType: 'blob'
    })
  }
}
