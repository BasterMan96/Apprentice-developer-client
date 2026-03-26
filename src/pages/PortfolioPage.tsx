import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Calendar, Terminal } from 'lucide-react'
import { apiClient } from '../api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortfolioItem {
  id: number
  submittedCode: string
  output: string
  taskDescription: string
  lessonTitle: string
  courseTitle: string
  submittedAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PortfolioSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
          <div className="h-5 bg-gray-200 rounded-full w-24" />
          <div className="h-4 bg-gray-200 rounded-full w-3/4" />
          <div className="h-3 bg-gray-100 rounded-full w-full" />
          <div className="h-24 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="h-3 bg-gray-100 rounded-full w-32" />
        </div>
      ))}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="text-6xl select-none">🗂️</span>
      <div>
        <p className="font-bold text-gray-900 text-lg">Здесь будут твои проекты</p>
        <p className="text-sm text-gray-400 mt-1">
          Выполняй практические задания, чтобы пополнить портфолио
        </p>
      </div>
      <button
        onClick={onNavigate}
        className="h-12 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm transition-colors shadow-sm"
      >
        Перейти к курсам
      </button>
    </div>
  )
}

// ─── Portfolio Card ───────────────────────────────────────────────────────────

interface PortfolioCardProps {
  item: PortfolioItem
  index: number
}

function PortfolioCard({ item, index }: PortfolioCardProps) {
  const isSuccess = Boolean(item.output && !item.output.toLowerCase().includes('error'))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3"
    >
      {/* Course badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
          <BookOpen size={11} />
          {item.courseTitle}
        </span>
      </div>

      {/* Lesson title */}
      <h3 className="font-bold text-gray-900 text-sm leading-snug">{item.lessonTitle}</h3>

      {/* Task description */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.taskDescription}</p>

      {/* Code block */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-700">
          <Terminal size={12} className="text-gray-400" />
          <span className="text-gray-400 text-xs font-mono">code.py</span>
        </div>
        <pre className="px-3 py-2.5 text-xs text-green-300 font-mono overflow-x-auto max-h-40 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-gray-700">
          <code>{item.submittedCode}</code>
        </pre>
      </div>

      {/* Output */}
      {item.output && (
        <div
          className={`rounded-xl px-3 py-2.5 text-xs font-mono leading-relaxed overflow-x-auto ${
            isSuccess
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <p className="font-semibold mb-0.5 text-[10px] uppercase tracking-wide opacity-60">
            {isSuccess ? 'Вывод' : 'Ошибка'}
          </p>
          <pre className="whitespace-pre-wrap">{item.output}</pre>
        </div>
      )}

      {/* Date */}
      <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-auto pt-1">
        <Calendar size={12} />
        <span>{formatDate(item.submittedAt)}</span>
      </div>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    apiClient
      .get<PortfolioItem[]>('/users/portfolio')
      .then(({ data }) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 pb-10"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Портфолио</h1>
        <p className="text-sm text-gray-400 mt-1">Твои выполненные задания</p>
      </div>

      {/* Content */}
      {isLoading ? (
        <PortfolioSkeleton />
      ) : items.length === 0 ? (
        <EmptyState onNavigate={() => navigate('/courses')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, index) => (
            <PortfolioCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
