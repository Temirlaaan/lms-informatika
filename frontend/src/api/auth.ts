import api from './axios';
import type { LoginRequest, RegisterRequest } from '../types';

export const loginUser = (data: LoginRequest) =>
  api.post('/auth/login/', data);

export const registerUser = (data: RegisterRequest) =>
  api.post('/auth/register/', data);

export const getProfile = () =>
  api.get('/auth/profile/');

export const updateProfile = (data: FormData) =>
  api.put('/auth/profile/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const refreshToken = (refresh: string) =>
  api.post('/auth/token/refresh/', { refresh });
