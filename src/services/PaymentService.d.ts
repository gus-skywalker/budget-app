declare namespace _default {
    function createSubscription(customerRequest: any): Promise<import("axios").AxiosResponse<any, any>>;
    function createCheckoutSession(customerRequest: any): Promise<import("axios").AxiosResponse<any, any>>;
    function openBillingPortal(customerRequest: any): Promise<import("axios").AxiosResponse<any, any>>;
    function updatePlan(selectedPlan: any): Promise<import("axios").AxiosResponse<any, any>>;
    function loadSubscriptionDetails(userId: any): Promise<import("axios").AxiosResponse<any, any>>;
    function cancelSubscription(subscriptionId: any): Promise<import("axios").AxiosResponse<any, any>>;
}
export default _default;
