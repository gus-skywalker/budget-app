declare namespace _default {
    function fetchGroups(): Promise<import("axios").AxiosResponse<any, any>>;
    function createGroup(group: any): Promise<import("axios").AxiosResponse<any, any>>;
    function fetchGroupMembers(groupId: any): Promise<import("axios").AxiosResponse<any, any>>;
    function inviteMember(groupId: any, email: any): Promise<import("axios").AxiosResponse<any, any>>;
    function respondInvite(groupId: any, userId: any, action: any): Promise<import("axios").AxiosResponse<any, any>>;
}
export default _default;
