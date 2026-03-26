import { apiClient } from './client'
import type { Lesson, LessonCompleteRequest, LessonCompleteResponse, CodeRunRequest, CodeRunResponse } from '../types'

export async function fetchLesson(id: number): Promise<Lesson> {
  const { data } = await apiClient.get<Lesson>(`/lessons/${id}`)
  return data
}

export async function completeLesson(id: number, req: LessonCompleteRequest): Promise<LessonCompleteResponse> {
  const { data } = await apiClient.post<LessonCompleteResponse>(`/lessons/${id}/complete`, req)
  return data
}

export async function runCode(req: CodeRunRequest): Promise<CodeRunResponse> {
  const { data } = await apiClient.post<CodeRunResponse>('/code/run', req)
  return data
}
