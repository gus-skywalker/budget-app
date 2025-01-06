declare namespace _default {
    function fetchFinancialGoals(): Promise<import("axios").AxiosResponse<any, any>>;
    function createFinancialGoal(goalData: any): Promise<import("axios").AxiosResponse<any, any>>;
    function updateFinancialGoal(id: any, goalData: any): Promise<import("axios").AxiosResponse<any, any>>;
    function deleteFinancialGoal(id: any): Promise<import("axios").AxiosResponse<any, any>>;
    function addContribution(goalId: any, contributionData: any): Promise<import("axios").AxiosResponse<any, any>>;
    function deleteContribution(goalId: any, contributionId: any): Promise<import("axios").AxiosResponse<any, any>>;
    function suggestGoalsBasedOnIncome(overview: any): Promise<import("axios").AxiosResponse<any, any>>;
}
export default _default;
