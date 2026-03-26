import { apiClient } from './client'
import type { User, UserStats, UserCourseEnrollment, Achievement, Certificate } from '../types'

export interface ProfileResponse {
  user: User
  stats: UserStats
}

export interface PortfolioItemDto {
  id: number
  title: string
  description: string
  imageUrl?: string
  projectUrl?: string
  createdAt: string
}

export async function fetchProfile(): Promise<ProfileResponse> {
  const { data } = await apiClient.get<ProfileResponse>('/users/profile')
  return data
}

export async function fetchMyCourses(): Promise<UserCourseEnrollment[]> {
  const { data } = await apiClient.get<UserCourseEnrollment[]>('/users/courses')
  return data
}

export async function fetchAchievements(): Promise<Achievement[]> {
  const { data } = await apiClient.get<Achievement[]>('/users/achievements')
  return data
}

export async function fetchCertificates(): Promise<Certificate[]> {
  const { data } = await apiClient.get<Certificate[]>('/users/certificates')
  return data
}

export async function fetchPortfolio(): Promise<PortfolioItemDto[]> {
  const { data } = await apiClient.get<PortfolioItemDto[]>('/users/portfolio')
  return data
}
