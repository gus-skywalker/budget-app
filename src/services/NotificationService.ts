
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

export interface NotificationPreference {
  eventType: string
  inboxEnabled: boolean
  emailEnabled: boolean
}

export type NotificationPreferenceMap = Record<string, NotificationPreference>

export interface NotificationPreferenceUpdate {
  eventType: string
  inboxEnabled?: boolean
  emailEnabled?: boolean
}

export interface ContactFormRequest {
  name: string
  email: string
  message: string
  source?: string
  originLabel?: string
  contextPath?: string
}

export interface ContactSubmissionResponse {
  submissionId: number
  email: string
  source: string
  originLabel?: string | null
  emailDeliveryStatus: string
  submittedAt?: string | null
  message: string
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
    return axiosInterceptor.put(`${API_URL}/settings`, settings)
  },
  getAlertSettings(): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/settings`)
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
  sendContactForm(contactData: ContactFormRequest): Promise<{ data: ContactSubmissionResponse }> {
    return axiosInterceptor.post(`${API_URL}/contact`, contactData)
  },
  getPreferences(): Promise<{ data: NotificationPreferenceMap }> {
    return axiosInterceptor.get(`${API_URL}/preferences`)
  },
  updatePreferences(preferences: NotificationPreferenceUpdate[]): Promise<{ data: NotificationPreferenceMap }> {
    return axiosInterceptor.put(`${API_URL}/preferences`, preferences)
  }
}

export default NotificationService;
