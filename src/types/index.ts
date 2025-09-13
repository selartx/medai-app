export interface AIResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UserInput {
  query: string;
  userId: string;
}