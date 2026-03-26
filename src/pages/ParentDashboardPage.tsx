import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Users, Zap, Trophy, BookOpen, GraduationCap, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { linkChild, fetchChildren } from '../api/parent'
import type { ChildProgressDto } from '../api/parent'

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold max-w-xs w-full ${
        type === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
      ) : (
        <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
      )}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </motion.div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

interface StatPillProps {
  icon: React.ReactNode
  label: string
  value: string | number
  accent: string
}

function StatPill({ icon, label, value, accent }: StatPillProps) {
  return (
    <div className={`flex flex-col items-center gap-1 p-3 rounded-xl ${accent} min-w-[70px]`}>
      <div className="opacity-75">{icon}</div>
      <p className="text-base font-extrabold leading-none">{value}</p>
      <p className="text-[10px] opacity-60 leading-tight text-center">{label}</p>
    </div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

interface ProgressBarProps {
  label: string
  percent: number
  completed?: boolean
}

function ProgressBar({ label, percent, completed }: ProgressBarProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-700 font-medium truncate flex-1 mr-2">{label}</p>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {completed ? '✅' : `${percent}%`}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            completed ? 'bg-green-500' : 'bg-primary-500'
          }`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  )
}

// ─── Child Card ───────────────────────────────────────────────────────────────

interface ChildCardProps {
  childData: ChildProgressDto
  index: number
}

function ChildCard({ childData, index }: ChildCardProps) {
  const { child, stats, recentCourses } = childData
  const initials = child.fullName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Child header */}
      <div className="bg-gradient-to-r from-primary-50 to-orange-50 px-4 py-4 flex items-center gap-3 border-b border-primary-100">
        <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-extrabold text-base flex-shrink-0">
          {child.avatarUrl ? (
            <img
              src={child.avatarUrl}
              alt={child.fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{child.fullName}</p>
          <p className="text-xs text-gray-400">@{child.login}</p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Stats grid */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          <StatPill
            icon={<Trophy size={16} className="text-primary-600" />}
            label="Уровень"
            value={`Ур.${stats.level}`}
            accent="bg-primary-50 text-primary-700"
          />
          <StatPill
            icon={<Zap size={16} className="text-amber-500" />}
            label="XP"
            value={stats.xp}
            accent="bg-amber-50 text-amber-700"
          />
          <StatPill
            icon={<span className="text-base select-none">💎</span>}
            label="Байтов"
            value={stats.bytesBalance}
            accent="bg-primary-50 text-primary-700"
          />
          <StatPill
            icon={<GraduationCap size={16} className="text-green-600" />}
            label="Курсов"
            value={stats.coursesCompleted}
            accent="bg-green-50 text-green-700"
          />
          <StatPill
            icon={<BookOpen size={16} className="text-blue-500" />}
            label="Уроков"
            value={stats.lessonsCompleted}
            accent="bg-blue-50 text-blue-700"
          />
        </div>

        {/* Recent courses progress */}
        {recentCourses && recentCourses.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Активные курсы
            </p>
            <div className="flex flex-col gap-2.5">
              {recentCourses.slice(0, 4).map((enrollment) => (
                <ProgressBar
                  key={enrollment.id}
                  label={enrollment.courseTitle}
                  percent={enrollment.progressPercent}
                  completed={Boolean(enrollment.completedAt)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent activity summary */}
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <span className="text-base select-none">📊</span>
          <p className="text-xs text-gray-600">
            Завершено{' '}
            <span className="font-bold text-gray-900">{stats.lessonsCompleted}</span>{' '}
            {stats.lessonsCompleted === 1 ? 'урок' : stats.lessonsCompleted < 5 ? 'урока' : 'уроков'}{' '}
            · Уровень <span className="font-bold text-primary-600">{stats.level}</span>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ChildrenSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-4 bg-gray-200 rounded-full w-32" />
              <div className="h-3 bg-gray-100 rounded-full w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-16 w-16 bg-gray-100 rounded-xl flex-shrink-0" />
            ))}
          </div>
          <div className="h-3 bg-gray-100 rounded-full w-full" />
          <div className="h-3 bg-gray-100 rounded-full w-4/5" />
        </div>
      ))}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyChildren() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="text-5xl select-none">👨‍👩‍👧</span>
      <p className="font-bold text-gray-900">Нет привязанных детей</p>
      <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
        Привяжите аккаунт ребёнка для отслеживания прогресса
      </p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ParentDashboardPage() {
  const [childLogin, setChildLogin] = useState('')
  const [isLinking, setIsLinking] = useState(false)
  const [children, setChildren] = useState<ChildProgressDto[]>([])
  const [isLoadingChildren, setIsLoadingChildren] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsLoadingChildren(true)
    fetchChildren()
      .then(setChildren)
      .catch(() => setChildren([]))
      .finally(() => setIsLoadingChildren(false))
  }, [])

  function showToast(message: string, type: ToastType) {
    setToast({ message, type })
  }

  async function handleLink() {
    const login = childLogin.trim()
    if (!login) {
      inputRef.current?.focus()
      return
    }

    setIsLinking(true)
    try {
      await linkChild(login)
      showToast(`Ребёнок @${login} успешно привязан!`, 'success')
      setChildLogin('')
      // Refresh children list
      const updated = await fetchChildren()
      setChildren(updated)
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Не удалось привязать аккаунт. Проверьте логин.'
      showToast(msg, 'error')
    } finally {
      setIsLinking(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleLink()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 pb-10"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Родительский контроль</h1>
        <p className="text-sm text-gray-400 mt-1">Следите за прогрессом ребёнка</p>
      </div>

      {/* Link child section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <UserPlus size={16} className="text-primary-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Привязать ребёнка</p>
            <p className="text-xs text-gray-400">Введите логин аккаунта ребёнка</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={childLogin}
            onChange={(e) => setChildLogin(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Логин ребёнка"
            disabled={isLinking}
            className="flex-1 h-12 px-4 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent disabled:opacity-50 transition"
          />
          <button
            onClick={handleLink}
            disabled={isLinking || !childLogin.trim()}
            className="h-12 px-5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors flex items-center gap-2 flex-shrink-0 shadow-sm"
          >
            {isLinking ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
            Привязать
          </button>
        </div>
      </div>

      {/* Children section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-gray-600" />
          <h2 className="text-lg font-extrabold text-gray-900">Дети</h2>
          {children.length > 0 && (
            <span className="ml-auto text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
              {children.length}
            </span>
          )}
        </div>

        {isLoadingChildren ? (
          <ChildrenSkeleton />
        ) : children.length === 0 ? (
          <EmptyChildren />
        ) : (
          <div className="flex flex-col gap-4">
            {children.map((childData, index) => (
              <ChildCard key={childData.child.id} childData={childData} index={index} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
