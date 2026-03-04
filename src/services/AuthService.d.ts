declare namespace _default {
    function signIn(payload: {
        email: string;
        password: string;
    }): Promise<import("axios").AxiosResponse<any, any>>;
    function signUp(payload: {
        username: string;
        email: string;
        password: string;
        language?: string;
    }): Promise<import("axios").AxiosResponse<any, any>>;
    function forgotPassword(email: string): Promise<import("axios").AxiosResponse<any, any>>;
    function resetPassword(token: string, newPassword: string): Promise<import("axios").AxiosResponse<any, any>>;
    function changePassword(currentPassword: string, newPassword: string): Promise<import("axios").AxiosResponse<any, any>>;
    function getUserInfo(): Promise<import("axios").AxiosResponse<any, any>>;
    function updateUser(userId: string, payload: {
        username?: string;
        email?: string;
        language?: string;
    }): Promise<import("axios").AxiosResponse<any, any>>;
    function deleteUser(userId: string): Promise<import("axios").AxiosResponse<any, any>>;
    function userTokenInfo(): Promise<import("axios").AxiosResponse<any, any>>;
    function refreshToken(refreshToken: string): Promise<import("axios").AxiosResponse<any, any>>;
    function getOAuthAuthorizationUrl(provider: "google" | "github"): string;
}
export default _default;
