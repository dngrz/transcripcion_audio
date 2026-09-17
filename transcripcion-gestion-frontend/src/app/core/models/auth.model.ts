export type Role = 'ADMIN' | 'USER';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}
