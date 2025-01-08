import axiosInterceptor from './axiosInterceptor'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/groups`

export default {
  fetchGroups() {
    return axiosInterceptor.get(API_URL)
  },
  createGroup(group) {
    return axiosInterceptor.post(API_URL, group)
  },
  fetchGroupMembers(groupId) {
    return axiosInterceptor.get(`${API_URL}/${groupId}/members`)
  },
  inviteMember(groupId, email) {
    return axiosInterceptor.post(`${API_URL}/${groupId}/invite`, { email })
  },
  respondInvite(groupId, userId, action) {
    return axiosInterceptor.get(`${API_URL}/${groupId}/respond`, {
      params: {
        action: action,
        user: userId
      }
    })
  }
}
