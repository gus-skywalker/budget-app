interface User {
    id?: string;
    username?: string;
    email?: string;
    avatar?: string;
}
interface State {
    token: string | null;
    auth: boolean;
    user: User;
}
export declare const useUserStore: import("pinia").StoreDefinition<"userStore", State, {
    getUser: (state: {
        token: string | null;
        auth: boolean;
        user: {
            id?: string | undefined;
            username?: string | undefined;
            email?: string | undefined;
            avatar?: string | undefined;
        };
    } & import("pinia").PiniaCustomStateProperties<State>) => {
        id?: string | undefined;
        username?: string | undefined;
        email?: string | undefined;
        avatar?: string | undefined;
    };
    isAuthenticated: (state: {
        token: string | null;
        auth: boolean;
        user: {
            id?: string | undefined;
            username?: string | undefined;
            email?: string | undefined;
            avatar?: string | undefined;
        };
    } & import("pinia").PiniaCustomStateProperties<State>) => boolean;
    getToken: (state: {
        token: string | null;
        auth: boolean;
        user: {
            id?: string | undefined;
            username?: string | undefined;
            email?: string | undefined;
            avatar?: string | undefined;
        };
    } & import("pinia").PiniaCustomStateProperties<State>) => string | null;
}, {
    setToken(value: string | null): void;
    setAuth(value: boolean): void;
    setUser(value: User): void;
    resetUser(): void;
    saveState(): void;
}>;
export {};
