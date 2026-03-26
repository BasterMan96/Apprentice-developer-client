import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, ArrowLeft, BookOpen, Puzzle, Code2, Rocket, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchCourse, enrollCourse } from '../api/courses'
import type { Course, Module, Lesson, Difficulty, LessonType, ProgressStatus } from '../types'

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

// Lesson type icons
const LESSON_TYPE_ICON: Record<LessonType, React.ReactNode> = {
  THEORY: <BookOpen size={16} className="text-blue-500" />,
  QUIZ: <Puzzle size={16} className="text-purple-500" />,
  PRACTICE: <Code2 size={16} className="text-green-600" />,
  PROJECT: <Rocket size={16} className="text-orange-500" />,
}

const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  THEORY: 'Теория',
  QUIZ: 'Квиз',
  PRACTICE: 'Практика',
  PROJECT: 'Проект',
}

// Helpers
function isCompleted(status?: ProgressStatus) {
  return status === 'COMPLETED'
}

// Lesson row
interface LessonRowProps {
  lesson: Lesson
  courseId: number
  moduleIndex: number
  lessonIndex: number
}

function LessonRow({ lesson, courseId }: LessonRowProps) {
  const navigate = useNavigate()
  const completed = isCompleted(lesson.userProgress?.status)

  return (
    <button
      onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors group
        ${completed
          ? 'bg-green-50 hover:bg-green-100'
          : 'bg-gray-50 hover:bg-primary-50'
        }`}
    >
      {/* Type icon */}
      <span className="flex-shrink-0">{LESSON_TYPE_ICON[lesson.lessonType]}</span>

      {/* Title */}
      <span className={`flex-1 text-sm font-medium ${completed ? 'text-green-800' : 'text-gray-800'}`}>
        {lesson.title}
      </span>

      {/* Rewards */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {lesson.xpReward > 0 && (
          <span className="text-xs text-amber-600 font-medium">+{lesson.xpReward} XP</span>
        )}
        {lesson.bytesReward > 0 && (
          <span className="text-xs text-primary-600 font-medium">💎{lesson.bytesReward}</span>
        )}
        {completed && (
          <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
        )}
      </div>
    </button>
  )
}

// Module accordion item
interface ModuleItemProps {
  module: Module
  courseId: number
  index: number
  defaultOpen?: boolean
}

function ModuleItem({ module, courseId, index, defaultOpen = false }: ModuleItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const lessons = module.lessons ?? []
  const completedCount = lessons.filter((l) => isCompleted(l.userProgress?.status)).length

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        {/* Module number */}
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold text-sm flex items-center justify-center">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-snug">{module.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {completedCount}/{lessons.length} уроков выполнено
          </p>
        </div>

        {/* Progress mini bar */}
        {lessons.length > 0 && (
          <div className="w-16 hidden sm:block">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-400 rounded-full transition-all"
                style={{ width: `${(completedCount / lessons.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        <span className="flex-shrink-0 text-gray-400">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {/* Lessons list */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-2 bg-white border-t border-gray-100">
              {module.description && (
                <p className="text-sm text-gray-500 pt-3 pb-1">{module.description}</p>
              )}
              {lessons.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">Уроки не добавлены</p>
              ) : (
                lessons
                  .slice()
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((lesson, li) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      courseId={courseId}
                      moduleIndex={index}
                      lessonIndex={li}
                    />
                  ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Skeleton
function CourseSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-5">
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="h-6 bg-gray-200 rounded-full w-3/4" />
      <div className="h-4 bg-gray-100 rounded-full w-full" />
      <div className="h-4 bg-gray-100 rounded-full w-5/6" />
      <div className="h-12 bg-gray-200 rounded-xl" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 rounded-2xl" />
      ))}
    </div>
  )
}

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()

  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [progressPercent, setProgressPercent] = useState(0)

  useEffect(() => {
    if (!courseId) return
    setIsLoading(true)
    setError(null)
    fetchCourse(Number(courseId))
      .then((data) => {
        setCourse(data)
        // Check enrollment from data if backend returns it
        // For now, we derive from lessons progress
        if (data.modules) {
          const allLessons = data.modules.flatMap((m: Module) => m.lessons ?? [])
          const completedCount = allLessons.filter((l: Lesson) =>
            isCompleted(l.userProgress?.status),
          ).length
          if (allLessons.length > 0) {
            setProgressPercent(Math.round((completedCount / allLessons.length) * 100))
            setEnrolled(completedCount > 0)
          }
        }
      })
      .catch(() => setError('Не удалось загрузить курс. Попробуй позже.'))
      .finally(() => setIsLoading(false))
  }, [courseId])

  const handleEnroll = async () => {
    if (!courseId) return
    setIsEnrolling(true)
    try {
      await enrollCourse(Number(courseId))
      setEnrolled(true)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message ?? 'Не удалось записаться на курс')
    } finally {
      setIsEnrolling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="pb-6">
        <CourseSkeleton />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="text-5xl">😕</div>
        <p className="text-gray-500">{error ?? 'Курс не найден'}</p>
        <button
          onClick={() => navigate('/courses')}
          className="text-primary-600 font-semibold hover:underline text-sm"
        >
          Вернуться к каталогу
        </button>
      </div>
    )
  }

  const difficulty = course.difficulty as Difficulty
  const modules = (course.modules ?? [])
    .slice()
    .sort((a: Module, b: Module) => a.orderIndex - b.orderIndex)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5 pb-6"
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 text-sm font-medium transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Все курсы
      </button>

      {/* Hero image */}
      <div
        className={`h-48 rounded-2xl bg-gradient-to-br ${DIFFICULTY_GRADIENT[difficulty] ?? 'from-gray-300 to-gray-400'} flex items-center justify-center overflow-hidden`}
      >
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-7xl select-none">💻</span>
        )}
      </div>

      {/* Title + meta */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_COLORS[difficulty] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {DIFFICULTY_LABELS[difficulty] ?? difficulty}
          </span>
          {course.ageFrom != null && course.ageTo != null && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
              {course.ageFrom}–{course.ageTo} лет
            </span>
          )}
          {course.totalBytesReward > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-600">
              💎 {course.totalBytesReward} байтов
            </span>
          )}
        </div>
        <h1 className="text-xl font-extrabold text-gray-900 leading-snug md:text-2xl">
          {course.title}
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">{course.description}</p>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 text-sm text-gray-500">
        {course.modulesCount != null && (
          <span>📚 {course.modulesCount} модулей</span>
        )}
        {course.lessonsCount != null && (
          <span>📝 {course.lessonsCount} уроков</span>
        )}
      </div>

      {/* Enrollment / progress block */}
      {enrolled ? (
        <div className="flex flex-col gap-3 bg-primary-50 border border-primary-100 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary-700">Прогресс</span>
            <span className="text-sm font-bold text-primary-600">{progressPercent}% пройдено</span>
          </div>
          <div className="h-2.5 bg-primary-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-primary-500 rounded-full"
            />
          </div>
          <button
            onClick={() => {
              // Navigate to first non-completed lesson
              const firstLesson = modules
                .flatMap((m: Module) => m.lessons ?? [])
                .sort((a: Lesson, b: Lesson) => a.orderIndex - b.orderIndex)
                .find((l: Lesson) => !isCompleted(l.userProgress?.status))
              if (firstLesson) {
                navigate(`/courses/${courseId}/lessons/${firstLesson.id}`)
              }
            }}
            className="h-12 w-full rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors"
          >
            Продолжить обучение
          </button>
        </div>
      ) : (
        <button
          onClick={handleEnroll}
          disabled={isEnrolling}
          className="h-12 w-full rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-60 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          {isEnrolling ? (
            <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Записаться на курс'
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* Modules accordion */}
      {modules.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-gray-900">Программа курса</h2>
          {modules.map((module: Module, index: number) => (
            <ModuleItem
              key={module.id}
              module={module}
              courseId={Number(courseId)}
              index={index}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
