declare namespace _default {
    export function getAll(): Promise<import("axios").AxiosResponse<any, any>>;
    export function get(id: any): Promise<import("axios").AxiosResponse<any, any>>;
    export function create(data: any): Promise<import("axios").AxiosResponse<any, any>>;
    export function uploadAttachment(expenseId: any, formData: any, config?: any): Promise<any>;
    export function listAttachments(expenseId: any): Promise<any>;
    export function removeAttachment(expenseId: any, attachmentId: any): Promise<import("axios").AxiosResponse<any, any>>;
    export function downloadAttachment(expenseId: any, attachmentId: any): Promise<any>;
    export function update(id: any, data: any): Promise<import("axios").AxiosResponse<any, any>>;
    function _delete(id: any): Promise<import("axios").AxiosResponse<any, any>>;
    export { _delete as delete };
    export function fetchMonthlyExpenses(monthNumber: any, year: any, pagination?: {
        limit?: number;
        offset?: number;
    }): Promise<any>;
}
export default _default;
