import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchCourses } from '../api/courses'
import type { Course, Difficulty } from '../types'

// Difficulty config
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  BEGINNER: 'Начинающий',
  INTERMEDIATE: 'Средний',
  ADVANCED: 'Продвинутый',
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED: 'bg-red-100 text-red-700',
}

const DIFFICULTY_GRADIENT: Record<Difficulty, string> = {
  BEGINNER: 'from-green-400 to-emerald-500',
  INTERMEDIATE: 'from-yellow-400 to-orange-400',
  ADVANCED: 'from-red-400 to-rose-500',
}

type FilterValue = 'ALL' | Difficulty

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'Все', value: 'ALL' },
  { label: 'Начинающий', value: 'BEGINNER' },
  { label: 'Средний', value: 'INTERMEDIATE' },
  { label: 'Продвинутый', value: 'ADVANCED' },
]

// Skeleton card
function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-200" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-5/6" />
        <div className="flex gap-2 mt-1">
          <div className="h-5 bg-gray-200 rounded-full w-20" />
          <div className="h-5 bg-gray-200 rounded-full w-16" />
        </div>
      </div>
    </div>
  )
}

// Course card
interface CourseCardProps {
  course: Course
  onClick: () => void
}

function CourseCard({ course, onClick }: CourseCardProps) {
  const difficulty = course.difficulty as Difficulty
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden cursor-pointer transition-shadow"
    >
      {/* Image / gradient placeholder */}
      <div
        className={`h-36 bg-gradient-to-br ${DIFFICULTY_GRADIENT[difficulty] ?? 'from-gray-300 to-gray-400'} flex items-center justify-center`}
      >
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl select-none">💻</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
          {course.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2 mt-1">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[difficulty] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {DIFFICULTY_LABELS[difficulty] ?? difficulty}
          </span>
          {course.ageFrom != null && course.ageTo != null && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              {course.ageFrom}–{course.ageTo} лет
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
          {course.modulesCount != null && (
            <span>📚 {course.modulesCount} модулей</span>
          )}
          {course.lessonsCount != null && (
            <span>📝 {course.lessonsCount} уроков</span>
          )}
          {course.totalBytesReward != null && (
            <span className="text-primary-600 font-semibold">
              💎 {course.totalBytesReward} байтов
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function CoursesPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<FilterValue>('ALL')

  const loadCourses = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchCourses(search || undefined, difficulty !== 'ALL' ? difficulty : undefined)
      setCourses(data)
    } catch {
      setError('Не удалось загрузить курсы. Попробуй позже.')
    } finally {
      setIsLoading(false)
    }
  }, [search, difficulty])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCourses()
    }, 400)
    return () => clearTimeout(timer)
  }, [loadCourses])

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Каталог курсов</h1>
        <p className="text-gray-500 text-sm mt-1">Выбери курс и начни учиться прямо сейчас</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="search"
          placeholder="Поиск курсов..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 w-full rounded-xl border border-gray-300 pl-10 pr-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
        />
      </div>

      {/* Difficulty filter chips */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setDifficulty(value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
              difficulty === value
                ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 text-base">Курсы не найдены</p>
          <p className="text-gray-400 text-sm mt-1">Попробуй изменить поиск или фильтры</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <CourseCard
                  course={course}
                  onClick={() => navigate(`/courses/${course.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
