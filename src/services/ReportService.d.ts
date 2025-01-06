export default class ReportService {
    generateReportPDF(reportType: any, reportRequest: any): Promise<import("axios").AxiosResponse<any, any>>;
    generateReportXLSX(reportType: any, reportRequest: any): Promise<import("axios").AxiosResponse<any, any>>;
}
