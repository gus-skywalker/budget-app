
import axiosInterceptor from './axiosInterceptor'

export interface Notification {
  id: string;
  destinationUser: string;
  message: string;
  status: string;
  // Add other fields as needed
}

export interface UserSettings {
  // Define user settings fields here
  [key: string]: any;
}

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/notifications`

const NotificationService = {
  getNotifications(): Promise<any> {
    return axiosInterceptor.get(`${API_URL}`)
  },
  accept(notificationId: string): Promise<any> {
    return axiosInterceptor.put(`${API_URL}/${notificationId}/accept`)
  },
  decline(notificationId: string): Promise<any> {
    return axiosInterceptor.put(`${API_URL}/${notificationId}/decline`)
  },
  sendEmail(expenseRequest: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/sendEmail/html`, expenseRequest)
  },
  sendEmailWithAttachment(request: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/sendEmail/attachment`, request)
  },
  updateAlertSettings(settings: any): Promise<any> {
    return axiosInterceptor.put(`${API_URL}/alerts/settings`, settings)
  },
  getAlertSettings(): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/alerts/settings`)
  },
  scheduleExpenseAlert(expenseRequest: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/alerts/schedule`, expenseRequest)
  },
  updateExpenseAlert(expenseRequest: any): Promise<any> {
    return axiosInterceptor.put(`${API_URL}/alerts/update`, expenseRequest)
  }
}

export default NotificationService;
