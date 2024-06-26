import axiosInterceptor from './axiosInterceptor'

const API_URL = 'http://localhost:8080/api/groups'

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
  }
}
