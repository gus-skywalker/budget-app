declare namespace _default {
    function userTokenInfo(): Promise<import("axios").AxiosResponse<any, any>>;
    function refreshToken(refreshToken: string): Promise<import("axios").AxiosResponse<any, any>>;
}
export default _default;
