declare namespace _default {
    function fetchGroups(): Promise<import("axios").AxiosResponse<any, any>>;
    function fetchGroupsByWorkspace(workspaceId: string): Promise<import("axios").AxiosResponse<any, any>>;
    function createGroup(group: any): Promise<import("axios").AxiosResponse<any, any>>;
    function fetchGroupMembers(groupId: any): Promise<import("axios").AxiosResponse<any, any>>;
    function inviteMember(groupId: any, email: any): Promise<import("axios").AxiosResponse<any, any>>;
    function acceptInvite(groupId: any, token: any): Promise<import("axios").AxiosResponse<any, any>>;
    function declineInvite(groupId: any, token: any): Promise<import("axios").AxiosResponse<any, any>>;
    function listInvites(groupId: any): Promise<import("axios").AxiosResponse<any, any>>;
    function cancelInvite(groupId: any, inviteId: any): Promise<import("axios").AxiosResponse<any, any>>;
}
export default _default;
