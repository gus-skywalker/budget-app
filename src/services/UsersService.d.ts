declare namespace _default {
    function fetchUsers(): Promise<import("axios").AxiosResponse<any, any>>;
    function notifyUser(userId: any, expense: any): Promise<import("axios").AxiosResponse<any, any>>;
}
export default _default;
