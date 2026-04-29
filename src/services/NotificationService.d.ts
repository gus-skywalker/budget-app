// NotificationService.d.ts

declare module '@/services/NotificationService' {
  export interface Notification {
    id: number
    destinationUser: {
      id: number
      username: string
      email: string
      avatar: string
    }
    message: string
    status: string
  }

  export interface ExpenseNotification {
    user: {
      email: string
      name: string
    }
    expense: {
      id: string
      amount: number
      category: object
      paymentMethod: object
    }
    daysBefore: number
  }

  export interface UserSettings {
    data?: any
    alertDaysBefore: number
    notificationEmail: boolean
    notificationPush: boolean
    darkTheme: boolean
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

  export function accept(notificationId: number): Promise<void>
  export function decline(notificationId: number): Promise<void>
  export function getNotifications(): Promise<{ data: any[] }>
  export function sendEmail(notification: ExpenseNotification): Promise<void>
  export function sendContactForm(contactData: ContactFormRequest): Promise<{ data: ContactSubmissionResponse }>
  export function updateAlertSettings(settings: UserSettings): Promise<void>
  export function getAlertSettings(): Promise<UserSettings>
  export function getPreferences(): Promise<{ data: NotificationPreferenceMap }>
  export function updatePreferences(preferences: NotificationPreferenceUpdate[]): Promise<{ data: NotificationPreferenceMap }>
  export function scheduleExpenseAlert(notification: ExpenseNotification): Promise<void>
  export function updateExpenseAlert(notification: ExpenseNotification): Promise<void>
}
