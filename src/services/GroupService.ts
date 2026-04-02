import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/groups`
const WORKSPACES_API_URL = `${import.meta.env.VITE_API_BASE_URL}/workspaces`

export default {
  fetchGroups(): Promise<any> {
    return axiosInterceptor.get(API_URL)
  },
  fetchGroupsByWorkspace(workspaceId: string): Promise<any> {
    return axiosInterceptor.get(`${WORKSPACES_API_URL}/${workspaceId}/groups`)
  },
  createGroup(group: any): Promise<any> {
    return axiosInterceptor.post(API_URL, group)
  },
  fetchGroupMembers(groupId: string): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/${groupId}/members`)
  },

  // Invites (canônico)
  inviteMember(groupId: string, email: string): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/${groupId}/invites`, { email })
  },

  acceptInvite(groupId: string, token: string): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/${groupId}/invites/${token}/accept`)
  },

  declineInvite(groupId: string, token: string): Promise<any> {
    return axiosInterceptor.post(`${API_URL}/${groupId}/invites/${token}/decline`)
  },

  listInvites(groupId: string): Promise<any> {
    return axiosInterceptor.get(`${API_URL}/${groupId}/invites`)
  },

  cancelInvite(groupId: string, inviteId: string): Promise<any> {
    return axiosInterceptor.delete(`${API_URL}/${groupId}/invites/${inviteId}`)
  }
}
