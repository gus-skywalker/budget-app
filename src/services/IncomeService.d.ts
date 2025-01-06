declare namespace _default {
    export function getAll(): Promise<import("axios").AxiosResponse<any, any>>;
    export function get(id: any): Promise<import("axios").AxiosResponse<any, any>>;
    export function create(data: any): Promise<import("axios").AxiosResponse<any, any>>;
    export function update(id: any, data: any): Promise<import("axios").AxiosResponse<any, any>>;
    function _delete(id: any): Promise<import("axios").AxiosResponse<any, any>>;
    export { _delete as delete };
    export function fetchMonthlyIncomes(month: any, year: any): Promise<import("axios").AxiosResponse<any, any>>;
    export function toggleRecurring(id: any, months: any): Promise<import("axios").AxiosResponse<any, any>>;
}
export default _default;
