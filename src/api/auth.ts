import { apiClient } from './client'
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types'

export async function loginApi(req: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', req)
  return data
}

export async function registerApi(req: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', req)
  return data
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me')
  return data
}
