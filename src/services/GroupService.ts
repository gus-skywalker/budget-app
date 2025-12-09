import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/groups`

export default {
  fetchGroups(): Promise<any> {
    return axiosInterceptor.get(API_URL)
  },
  createGroup(group: any): Promise<any> {
    return axiosInterceptor.post(API_URL, group)
  },
  fetchGroupMembers(groupId: string): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/${groupId}/members`)
  },
  inviteMember(groupId: string, email: string): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/${groupId}/invite`, { email })
  },
  respondInvite(groupId: string, userId: string, action: string): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/${groupId}/respond`, {
      params: {
        action: action,
        user: userId
      }
    })
  }
}
