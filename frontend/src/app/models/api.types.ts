export interface ApiEnvelope<T> {
  status: 'success' | 'error';
  data: T;
  message: string;
  errors: Record<string, string>;
}

export interface AuthUser {
  id: number;
  email: string;
  role: 'admin' | 'user';
  base_currency: string;
  language: string;
}
