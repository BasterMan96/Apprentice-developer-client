export type UserRole = 'STUDENT' | 'PARENT'
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type LessonType = 'THEORY' | 'PRACTICE' | 'QUIZ' | 'PROJECT'
export type ProgressStatus = 'IN_PROGRESS' | 'COMPLETED'

export interface User {
  id: number
  fullName: string
  login: string
  phone: string
  role: UserRole
  avatarUrl?: string
  level: number
  xp: number
  bytesBalance: number
  createdAt: string
}

export interface Course {
  id: number
  title: string
  description: string
  imageUrl: string
  difficulty: Difficulty
  ageFrom: number
  ageTo: number
  orderIndex: number
  totalBytesReward: number
  modules?: Module[]
  modulesCount?: number
  lessonsCount?: number
}

export interface Module {
  id: number
  courseId: number
  title: string
  description: string
  orderIndex: number
  lessons?: Lesson[]
}

export interface Lesson {
  id: number
  moduleId: number
  title: string
  content?: string
  lessonType: LessonType
  orderIndex: number
  xpReward: number
  bytesReward: number
  quizQuestions?: QuizQuestion[]
  codeTasks?: CodeTask[]
  userProgress?: UserProgress
}

export interface QuizQuestion {
  id: number
  questionText: string
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'CODE'
  orderIndex: number
  options: QuizOption[]
}

export interface QuizOption {
  id: number
  optionText: string
  isCorrect?: boolean
}

export interface CodeTask {
  id: number
  description: string
  initialCode: string
  expectedOutput: string
  hint?: string
}

export interface UserProgress {
  id: number
  lessonId: number
  status: ProgressStatus
  score: number
  completedAt?: string
}

export interface UserCourseEnrollment {
  id: number
  courseId: number
  course?: Course
  progressPercent: number
  enrolledAt: string
  completedAt?: string
}

export interface Achievement {
  id: number
  title: string
  description: string
  iconUrl: string
  conditionType: string
  conditionValue: number
  earnedAt?: string
}

export interface Certificate {
  id: number
  courseId: number
  course?: Course
  issuedAt: string
  certificateNumber: string
}

export interface CodeSubmission {
  id: number
  codeTaskId: number
  codeTask?: CodeTask
  submittedCode: string
  output: string
  isCorrect: boolean
  submittedAt: string
}

// API request/response types
export interface RegisterRequest {
  fullName: string
  login: string
  phone?: string
  password: string
  role?: UserRole
}

export interface LoginRequest {
  login: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LessonCompleteRequest {
  quizAnswers?: { questionId: number; selectedOptionIds: number[] }[]
  code?: string
}

export interface LessonCompleteResponse {
  score: number
  xpEarned: number
  bytesEarned: number
  newLevel?: number
  achievementsUnlocked: Achievement[]
}

export interface CodeRunRequest {
  code: string
  language?: string
}

export interface CodeRunResponse {
  output: string
  error?: string
  executionTimeMs: number
}

export interface UserStats {
  totalXp: number
  level: number
  bytesBalance: number
  coursesCompleted: number
  lessonsCompleted: number
  streak: number
}

export interface ActivityDay {
  [date: string]: { lessonsCompleted: number }
}
