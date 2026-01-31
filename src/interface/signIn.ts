export interface SignIn {
  success: boolean;
  message: string;
  id: string;
  role: string;
  error_type?: string;
}