import axiosInterceptor from './axiosInterceptor'

export interface WorkspaceActivityEvent {
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
    return axiosInterceptor.get<WorkspaceActivityEvent[]>(`${API_URL}?limit=${limit}`)
  },
}

export default ActivityService
