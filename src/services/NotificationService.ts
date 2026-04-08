
import axiosInterceptor from './axiosInterceptor'

export interface Notification {
  id: string
  userId: string
  workspaceId: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt?: string
  metadata?: string
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
  getUnreadCount(): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/unread-count`)
  },
  markAsRead(notificationId: string): Promise<any> {
    return axiosInterceptor.put(`${API_URL}/${notificationId}/read`)
  },
  // Legacy methods kept for compatibility with existing screens.
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
  },
  sendEmail(expenseRequest: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/sendEmail/html`, expenseRequest)
  },
  sendEmailWithAttachment(request: any): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/sendEmail/attachment`, request)
  },
  sendContactForm(contactData: { name: string; email: string; message: string }): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/contact`, contactData)
  }
}

export default NotificationService;
