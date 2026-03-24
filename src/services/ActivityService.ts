import axiosInterceptor from './axiosInterceptor'

export interface CompanyActivityEvent {
  id: string
  actorUserId?: string
  eventType: string
  title: string
  description?: string
  relatedEntityType?: string
  relatedEntityId?: string
  createdAt: string
}

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/activity`

const ActivityService = {
  list(limit = 8) {
    return axiosInterceptor.get<CompanyActivityEvent[]>(`${API_URL}?limit=${limit}`)
  },
}

export default ActivityService
