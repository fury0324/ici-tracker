import { apiRequest } from './client';

export interface ApiUser {
  id: string;
  email: string;
  storeName: string;
  createdAt: string;
}

interface AuthResponse {
  token: string;
  user: ApiUser;
}

export function registerRequest(email: string, password: string, storeName: string) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { email, password, storeName },
  });
}

export function loginRequest(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function meRequest(token: string) {
  return apiRequest<{ user: ApiUser }>('/auth/me', { token });
}
