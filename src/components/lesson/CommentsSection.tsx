import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Trash2, Lock } from 'lucide-react'
import { fetchComments, createComment, deleteComment } from '../../api/comments'
import type { LessonComment } from '../../types'

// ─── Time formatter ───────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'только что'
  if (diffMin < 60) return `${diffMin} мин назад`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} ч назад`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} дн назад`
  return date.toLocaleDateString('ru-RU')
}

// ─── Avatar initials ──────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase()
}

// ─── Comment card ─────────────────────────────────────────────────────────────

interface CommentCardProps {
  comment: LessonComment
  onDelete: (id: number) => void
}

function CommentCard({ comment, onDelete }: CommentCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className="flex gap-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold select-none">
        {getInitials(comment.authorName)}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap mb-1">
          <span className="font-bold text-sm text-gray-900">{comment.authorName}</span>
          <span className="text-xs text-gray-400">@{comment.authorLogin}</span>
          <span className="text-xs text-gray-400 ml-auto">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed break-words">{comment.content}</p>
      </div>

      {/* Delete */}
      {comment.isOwn && (
        <button
          onClick={() => onDelete(comment.id)}
          className="flex-shrink-0 self-start p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Удалить комментарий"
        >
          <Trash2 size={16} />
        </button>
      )}
    </motion.div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CommentsSectionProps {
  lessonId: number
  isCompleted: boolean
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CommentsSection({ lessonId, isCompleted }: CommentsSectionProps) {
  const [comments, setComments] = useState<LessonComment[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (!isCompleted) return
    setIsLoading(true)
    try {
      const res = await fetchComments(lessonId)
      setComments(res.comments)
      setTotal(res.total)
    } catch {
      // fail silently — comments are non-critical
    } finally {
      setIsLoading(false)
    }
  }, [lessonId, isCompleted])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed || isSubmitting) return
    setIsSubmitting(true)
    try {
      const newComment = await createComment(lessonId, trimmed)
      setComments((prev) => [...prev, newComment])
      setTotal((t) => t + 1)
      setText('')
      // scroll to new comment
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    } catch {
      // fail silently
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    // optimistic remove
    const snapshot = comments
    setComments((prev) => prev.filter((c) => c.id !== commentId))
    setTotal((t) => Math.max(0, t - 1))
    try {
      await deleteComment(commentId)
    } catch {
      // rollback
      setComments(snapshot)
      setTotal(snapshot.length)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  // ── Locked state ──────────────────────────────────────────────────────────

  if (!isCompleted) {
    return (
      <div className="mt-8">
        <div className="flex flex-col items-center justify-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-6 py-8 text-center">
          <Lock size={28} className="text-gray-300" />
          <p className="text-sm font-medium text-gray-400">
            Пройди урок, чтобы открыть обсуждение
          </p>
        </div>
      </div>
    )
  }

  // ── Unlocked state ────────────────────────────────────────────────────────

  return (
    <div className="mt-8 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle size={20} className="text-primary-500" />
        <h3 className="font-extrabold text-gray-900 text-base">Обсуждение</h3>
        {total > 0 && (
          <span className="ml-1 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary-100 text-primary-600 text-xs font-bold">
            {total}
          </span>
        )}
      </div>

      {/* Comment form */}
      <div className="flex flex-col gap-2 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напиши комментарий..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:bg-white transition-colors"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isSubmitting}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors min-w-[44px]"
          >
            {isSubmitting ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send size={14} />
                Отправить
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <span className="inline-block h-6 w-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-sm text-gray-400"
        >
          Пока нет комментариев. Будь первым! 💬
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
