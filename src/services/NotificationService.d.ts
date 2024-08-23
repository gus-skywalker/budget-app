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
      amount: number
    }
  }

  export function accept(notificationId: number): Promise<void>
  export function decline(notificationId: number): Promise<void>
  export function getNotifications(): Promise<{ data: any[] }>
  export function sendEmail(notification: ExpenseNotification): Promise<void>
}
