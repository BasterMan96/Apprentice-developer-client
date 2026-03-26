import { apiClient } from './client'
import type { Course, UserCourseEnrollment } from '../types'

export async function fetchCourses(search?: string, difficulty?: string): Promise<Course[]> {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (difficulty && difficulty !== 'ALL') params.set('difficulty', difficulty)
  const { data } = await apiClient.get<Course[]>('/courses', { params })
  return data
}

export async function fetchCourse(id: number): Promise<Course> {
  const { data } = await apiClient.get<Course>(`/courses/${id}`)
  return data
}

export async function enrollCourse(id: number): Promise<UserCourseEnrollment> {
  const { data } = await apiClient.post<UserCourseEnrollment>(`/courses/${id}/enroll`)
  return data
}
