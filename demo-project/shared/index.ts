
export interface User {
  id: string;
  email: string;
  name?: string;
}

export type ApiResponse<T> = {
  data: T;
  message: string;
  status: number;
};
      