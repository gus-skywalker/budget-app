declare namespace _default {
    function getAll(): Promise<import("axios").AxiosResponse<any, any>>;
    function fetchCategories(language: any): Promise<import("axios").AxiosResponse<any, any>>;
    function fetchPaymentMethods(language: any): Promise<import("axios").AxiosResponse<any, any>>;
    function fetchChartData(timePeriod: any, category: any): Promise<import("axios").AxiosResponse<any, any>>;
    function fetchMonthOverview(): Promise<import("axios").AxiosResponse<any, any>>;
}
export default _default;
