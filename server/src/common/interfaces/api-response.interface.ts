export interface ApiResponseModel<T = any> {
  message?: string;
  error?: string;
  statusCode: number;
  data?: T;
}
