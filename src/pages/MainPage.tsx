import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Zap, Flame, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { fetchMyCourses } from '../api/users'
import { fetchCourses } from '../api/courses'
import { useAuthStore } from '../store/authStore'
import type { UserCourseEnrollment, Course, Difficulty } from '../types'

// ─── Difficulty config ─────────────────────────────────────────────────────────

const DIFFICULTY_GRADIENT: Record<Difficulty, string> = {
  BEGINNER: 'from-green-400 to-emerald-500',
  INTERMEDIATE: 'from-yellow-400 to-orange-400',
  ADVANCED: 'from-red-400 to-rose-500',
}

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

// ─── Section header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string
  linkLabel?: string
  onLink?: () => void
}

function SectionHeader({ title, linkLabel, onLink }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
      {linkLabel && onLink && (
        <button
          onClick={onLink}
          className="flex items-center gap-0.5 text-sm text-primary-600 font-semibold hover:underline"
        >
          {linkLabel}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}

// ─── My course card ────────────────────────────────────────────────────────────

interface MyCourseCardProps {
  enrollment: UserCourseEnrollment
}

function MyCourseCard({ enrollment }: MyCourseCardProps) {
  const navigate = useNavigate()
  const course = enrollment.course
  const progress = enrollment.progressPercent ?? 0
  const difficulty = course?.difficulty as Difficulty | undefined
  const gradient = difficulty ? DIFFICULTY_GRADIENT[difficulty] : 'from-primary-400 to-primary-600'

  return (
    <button
      onClick={() => navigate(`/courses/${enrollment.course?.id}`)}
      className="w-full text-left bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex gap-3 items-center p-3"
    >
      <div
        className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
      >
        {course?.imageUrl ? (
          <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl select-none">💻</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{course?.title ?? 'Курс'}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 font-medium flex-shrink-0">{progress}%</span>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
    </button>
  )
}

// ─── Catalog course card ───────────────────────────────────────────────────────

interface CatalogCourseCardProps {
  course: Course
}

function CatalogCourseCard({ course }: CatalogCourseCardProps) {
  const navigate = useNavigate()
  const difficulty = course.difficulty as Difficulty
  const gradient = DIFFICULTY_GRADIENT[difficulty] ?? 'from-primary-400 to-primary-600'
  const difficultyLabel = DIFFICULTY_LABELS[difficulty]
  const difficultyColor = DIFFICULTY_COLORS[difficulty] ?? 'bg-gray-100 text-gray-600'

  return (
    <button
      onClick={() => navigate(`/courses/${course.id}`)}
      className="w-full text-left bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex sm:flex-col"
    >
      {/* Image / gradient — horizontal on mobile (left side), full-width on desktop (top) */}
      <div
        className={`flex-shrink-0 w-24 sm:w-full sm:h-32 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
      >
        {course.imageUrl ? (
          <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl sm:text-4xl select-none">💻</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 p-3 flex flex-col gap-1.5 min-w-0">
        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColor}`}>
            {difficultyLabel}
          </span>
          {course.ageFrom != null && course.ageTo != null && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              {course.ageFrom}–{course.ageTo} лет
            </span>
          )}
        </div>

        {/* Title */}
        <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{course.title}</p>

        {/* Description */}
        {course.description && (
          <p className="text-xs text-gray-400 line-clamp-1 leading-relaxed">{course.description}</p>
        )}

        {/* Footer: lesson count + reward */}
        <div className="flex items-center gap-2 mt-auto pt-0.5">
          {course.lessonsCount != null && course.lessonsCount > 0 && (
            <span className="text-xs text-gray-500">📝 {course.lessonsCount} ур.</span>
          )}
          {course.totalBytesReward > 0 && (
            <span className="text-xs text-primary-500 font-semibold">💎 {course.totalBytesReward}</span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Quick stat pill ──────────────────────────────────────────────────────────

interface StatPillProps {
  icon: React.ReactNode
  value: string | number
  label: string
  accent: string
}

function StatPill({ icon, value, label, accent }: StatPillProps) {
  return (
    <div className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl ${accent} min-w-[80px]`}>
      <div className="opacity-80">{icon}</div>
      <p className="text-lg font-extrabold leading-none">{value}</p>
      <p className="text-xs opacity-70 leading-tight">{label}</p>
    </div>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-6 pb-24">
      <div className="h-8 bg-gray-200 rounded-full w-56" />
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 w-20 bg-gray-200 rounded-2xl flex-shrink-0" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-5 bg-gray-200 rounded-full w-40" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MainPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [enrollments, setEnrollments] = useState<UserCourseEnrollment[]>([])
  const [catalog, setCatalog] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      fetchMyCourses().catch(() => [] as UserCourseEnrollment[]),
      fetchCourses().catch(() => [] as Course[]),
    ])
      .then(([myCoursesRes, catalogRes]) => {
        setEnrollments(myCoursesRes)
        setCatalog(catalogRes)
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="pb-6">
        <DashboardSkeleton />
      </div>
    )
  }

  // Courses in progress (not completed), max 3
  const inProgress = enrollments
    .filter((e) => !e.completedAt)
    .slice(0, 3)

  // Enrolled course IDs to filter catalog
  const enrolledIds = new Set(enrollments.map((e) => e.courseId))

  // Recommended = not yet enrolled, max 4
  const recommended = catalog
    .filter((c) => !enrolledIds.has(c.id))
    .slice(0, 4)

  const displayName = user?.fullName ?? 'Ученик'
  const level = user?.level ?? 1
  const xp = user?.xp ?? 0
  const bytes = user?.bytesBalance ?? 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-7 pb-10"
    >
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
          Привет, {displayName}! 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1">Продолжим учиться?</p>
      </div>

      {/* Quick stats — horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        <StatPill
          icon={<Trophy size={20} className="text-primary-600" />}
          value={`Ур. ${level}`}
          label="Уровень"
          accent="bg-primary-50 text-primary-700"
        />
        <StatPill
          icon={<Zap size={20} className="text-amber-500" />}
          value={xp}
          label="XP"
          accent="bg-amber-50 text-amber-700"
        />
        <StatPill
          icon={<span className="text-xl select-none">💎</span>}
          value={bytes}
          label="Байтов"
          accent="bg-primary-50 text-primary-700"
        />
        {enrollments.length > 0 && (
          <StatPill
            icon={<Flame size={20} className="text-red-500" />}
            value={enrollments.length}
            label="Курсов"
            accent="bg-red-50 text-red-700"
          />
        )}
      </div>

      {/* Continue learning */}
      {inProgress.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Продолжить обучение"
            linkLabel="Все курсы"
            onLink={() => navigate('/learning')}
          />
          <div className="flex flex-col gap-2">
            {inProgress.map((e) => (
              <MyCourseCard key={e.id} enrollment={e} />
            ))}
          </div>
        </div>
      )}

      {/* Recommended courses */}
      {recommended.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Рекомендуемые курсы"
            linkLabel="Все"
            onLink={() => navigate('/courses')}
          />
          {/* Vertical stack on mobile, 3-column grid on lg+ */}
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3">
            {recommended.map((course) => (
              <CatalogCourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state if no courses at all */}
      {inProgress.length === 0 && recommended.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="text-6xl select-none">🚀</span>
          <div>
            <p className="font-bold text-gray-900 text-lg">Начни своё путешествие!</p>
            <p className="text-sm text-gray-400 mt-1">Выбери курс и приступай к обучению</p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="h-12 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm transition-colors shadow-sm"
          >
            Перейти к курсам
          </button>
        </div>
      )}
    </motion.div>
  )
}
