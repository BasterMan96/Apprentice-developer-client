import { apiClient } from './client'
import type { User, UserStats, UserCourseEnrollment } from '../types'

export interface ChildProgressDto {
  child: User
  stats: UserStatsDto
  recentCourses: EnrollmentDto[]
}

export interface UserStatsDto {
  level: number
  xp: number
  bytesBalance: number
  coursesCompleted: number
  lessonsCompleted: number
  streak?: number
}

export interface EnrollmentDto {
  id: number
  courseId: number
  courseTitle: string
  progressPercent: number
  enrolledAt: string
  completedAt?: string
}

export async function linkChild(childLogin: string): Promise<User> {
  const { data } = await apiClient.post<User>('/parent/link-child', { childLogin })
  return data
}

export async function fetchChildren(): Promise<ChildProgressDto[]> {
  const { data } = await apiClient.get<ChildProgressDto[]>('/parent/children')
  return data
}
