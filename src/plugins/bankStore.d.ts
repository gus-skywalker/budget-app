interface BankState {
    nubankToken: string | null;
    bbToken: string | null;
    otherBankToken: string | null;
}
export declare const useBankStore: import("pinia").StoreDefinition<"bankStore", BankState, {
    getNubankToken: (state: {
        nubankToken: string | null;
        bbToken: string | null;
        otherBankToken: string | null;
    } & import("pinia").PiniaCustomStateProperties<BankState>) => string | null;
    getBbToken: (state: {
        nubankToken: string | null;
        bbToken: string | null;
        otherBankToken: string | null;
    } & import("pinia").PiniaCustomStateProperties<BankState>) => string | null;
    getOtherBankToken: (state: {
        nubankToken: string | null;
        bbToken: string | null;
        otherBankToken: string | null;
    } & import("pinia").PiniaCustomStateProperties<BankState>) => string | null;
}, {
    setNubankToken(token: string | null): void;
    setBBToken(token: string | null): void;
    setOtherBankToken(token: string | null): void;
    clearTokens(): void;
}>;
export {};
