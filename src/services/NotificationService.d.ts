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
    alertDaysBefore: number
    notificationEmail: boolean
    notificationPush: boolean
    darkTheme: boolean
  }

  export function accept(notificationId: number): Promise<void>
  export function decline(notificationId: number): Promise<void>
  export function getNotifications(): Promise<{ data: any[] }>
  export function sendEmail(notification: ExpenseNotification): Promise<void>
  export function updateAlertSettings(settings: UserSettings): Promise<void>
  export function getAlertSettings(): Promise<UserSettings>
  export function scheduleExpenseAlert(notification: ExpenseNotification): Promise<void>
  export function updateExpenseAlert(notification: ExpenseNotification): Promise<void>
}
