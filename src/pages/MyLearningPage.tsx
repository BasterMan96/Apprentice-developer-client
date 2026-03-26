import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { fetchMyCourses } from '../api/users'
import type { UserCourseEnrollment, Difficulty } from '../types'

// ─── Difficulty config ─────────────────────────────────────────────────────────

const DIFFICULTY_GRADIENT: Record<Difficulty, string> = {
  BEGINNER: 'from-green-400 to-emerald-500',
  INTERMEDIATE: 'from-yellow-400 to-orange-400',
  ADVANCED: 'from-red-400 to-rose-500',
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function EnrollmentSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-28 bg-gray-200" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-5 bg-gray-200 rounded-full w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded-full" />
        <div className="h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )
}

// ─── Enrollment card ──────────────────────────────────────────────────────────

interface EnrollmentCardProps {
  enrollment: UserCourseEnrollment
}

function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
  const navigate = useNavigate()
  const course = enrollment.course
  const progress = enrollment.progressPercent ?? 0
  const difficulty = course?.difficulty as Difficulty | undefined
  const gradient = difficulty ? DIFFICULTY_GRADIENT[difficulty] : 'from-primary-400 to-primary-600'
  const isCompleted = !!enrollment.completedAt

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
    >
      {/* Course banner */}
      <div
        className={`h-28 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
      >
        {course?.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl select-none">💻</span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        <h3 className="font-bold text-gray-900 text-base leading-snug">
          {course?.title ?? 'Курс'}
        </h3>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Прогресс</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isCompleted ? 'bg-green-400' : 'bg-primary-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action */}
        {isCompleted ? (
          <div className="h-11 w-full rounded-xl bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center gap-2">
            Завершён ✓
          </div>
        ) : (
          <button
            onClick={() => navigate(`/courses/${enrollment.courseId}`)}
            className="h-11 w-full rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            Продолжить
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center">
        <BookOpen size={36} className="text-primary-400" />
      </div>
      <div>
        <p className="font-bold text-gray-900 text-lg">Вы ещё не записаны на курсы</p>
        <p className="text-sm text-gray-400 mt-1">Выберите курс и начните учиться!</p>
      </div>
      <button
        onClick={() => navigate('/courses')}
        className="h-12 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
      >
        Перейти к каталогу
      </button>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MyLearningPage() {
  const [enrollments, setEnrollments] = useState<UserCourseEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetchMyCourses()
      .then(setEnrollments)
      .catch(() => setError('Не удалось загрузить курсы. Попробуй позже.'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5 pb-10"
    >
      <h1 className="text-2xl font-extrabold text-gray-900">Моё обучение</h1>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <EnrollmentSkeleton key={i} />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Stats row */}
          <div className="flex gap-3 text-sm text-gray-500">
            <span className="font-medium">
              <span className="text-primary-600 font-bold">{enrollments.length}</span> курсов
            </span>
            <span>·</span>
            <span className="font-medium">
              <span className="text-green-600 font-bold">
                {enrollments.filter((e) => e.completedAt).length}
              </span>{' '}
              завершено
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enrollments.map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}
