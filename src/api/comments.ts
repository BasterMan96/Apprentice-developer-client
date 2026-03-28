import apiClient from './client'
import type { CommentsResponse, LessonComment } from '../types'

export async function fetchComments(lessonId: number): Promise<CommentsResponse> {
  const { data } = await apiClient.get(`/lessons/${lessonId}/comments`)
  return data
}

export async function createComment(lessonId: number, content: string): Promise<LessonComment> {
  const { data } = await apiClient.post(`/lessons/${lessonId}/comments`, { content })
  return data
}

export async function deleteComment(commentId: number): Promise<void> {
  await apiClient.delete(`/comments/${commentId}`)
}
