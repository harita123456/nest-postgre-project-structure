export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data?: T | null | [];
  error?: unknown;
  total?: number | null;
}