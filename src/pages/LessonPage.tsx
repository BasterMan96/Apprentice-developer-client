import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Send, Lightbulb, Star, Zap, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { fetchLesson, completeLesson, runCode } from '../api/lessons'
import { useAuthStore } from '../store/authStore'
import type {
  Lesson,
  QuizQuestion,
  LessonCompleteResponse,
  Achievement,
} from '../types'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LessonSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-5 pb-24">
      <div className="h-5 bg-gray-200 rounded-full w-24" />
      <div className="h-7 bg-gray-200 rounded-full w-3/4" />
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded-full w-20" />
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-100 rounded-full w-full" />
        ))}
      </div>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

interface LessonHeaderProps {
  lesson: Lesson
  courseId: string
}

function LessonHeader({ lesson, courseId }: LessonHeaderProps) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-3 mb-5">
      <button
        onClick={() => navigate(`/courses/${courseId}`)}
        className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 text-sm font-medium transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        К курсу
      </button>
      <h1 className="text-xl font-extrabold text-gray-900 leading-snug md:text-2xl">
        {lesson.title}
      </h1>
      <div className="flex gap-2">
        {lesson.xpReward > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            <Zap size={12} />
            +{lesson.xpReward} XP
          </span>
        )}
        {lesson.bytesReward > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 border border-primary-200">
            💎 +{lesson.bytesReward} байт
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Animated number counter ──────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let current = 0
    const step = Math.max(1, Math.ceil(value / 30))
    const timer = setInterval(() => {
      current = Math.min(current + step, value)
      setDisplay(current)
      if (current >= value) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display}</span>
}

// ─── Achievement card ─────────────────────────────────────────────────────────

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3"
    >
      <span className="text-3xl select-none">{achievement.iconUrl || '🏆'}</span>
      <div>
        <p className="font-bold text-sm text-yellow-800">{achievement.title}</p>
        <p className="text-xs text-yellow-600">{achievement.description}</p>
      </div>
    </motion.div>
  )
}

// ─── Result Overlay ───────────────────────────────────────────────────────────

interface ResultOverlayProps {
  result: LessonCompleteResponse
  lessonType: string
  courseId: string
  onRetry?: () => void
}

function ResultOverlay({ result, lessonType, courseId, onRetry }: ResultOverlayProps) {
  const navigate = useNavigate()
  const isQuiz = lessonType === 'QUIZ'
  const passed = !isQuiz || result.score >= 50

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col gap-5 shadow-2xl"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            {passed ? (
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle size={48} className="text-red-400" />
              </div>
            )}
          </motion.div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">
            {passed ? 'Отлично!' : 'Попробуй ещё раз'}
          </h2>
          {isQuiz && (
            <p className="text-gray-500 text-sm mt-1">
              Результат: <span className="font-bold text-primary-600">{result.score}%</span>
            </p>
          )}
        </div>

        {/* Rewards */}
        {passed && (
          <div className="flex justify-center gap-4">
            {result.xpEarned > 0 && (
              <div className="flex flex-col items-center gap-1 bg-amber-50 rounded-xl px-4 py-3">
                <Zap size={20} className="text-amber-500" />
                <span className="text-lg font-extrabold text-amber-600">
                  +<AnimatedNumber value={result.xpEarned} />
                </span>
                <span className="text-xs text-amber-500">XP</span>
              </div>
            )}
            {result.bytesEarned > 0 && (
              <div className="flex flex-col items-center gap-1 bg-primary-50 rounded-xl px-4 py-3">
                <span className="text-xl select-none">💎</span>
                <span className="text-lg font-extrabold text-primary-600">
                  +<AnimatedNumber value={result.bytesEarned} />
                </span>
                <span className="text-xs text-primary-500">байт</span>
              </div>
            )}
          </div>
        )}

        {/* New level */}
        {result.newLevel && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-primary-500 to-amber-500 rounded-xl p-4 text-center text-white"
          >
            <Star size={24} className="mx-auto mb-1" />
            <p className="font-extrabold text-lg">Новый уровень!</p>
            <p className="text-3xl font-black">{result.newLevel}</p>
          </motion.div>
        )}

        {/* Achievements */}
        {result.achievementsUnlocked.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold text-gray-700">Достижения разблокированы:</p>
            {result.achievementsUnlocked.map((a) => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {!passed && onRetry && (
            <button
              onClick={onRetry}
              className="h-12 w-full rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw size={16} />
              Попробовать снова
            </button>
          )}
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className={`h-12 w-full rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors ${
              passed
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Вернуться к курсу
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Theory lesson ────────────────────────────────────────────────────────────

interface TheoryLessonProps {
  lesson: Lesson
  onComplete: () => Promise<void>
  isCompleting: boolean
}

function TheoryLesson({ lesson, onComplete, isCompleting }: TheoryLessonProps) {
  const alreadyDone = lesson.userProgress?.status === 'COMPLETED'

  return (
    <div className="flex flex-col gap-6">
      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed
        prose-headings:font-extrabold prose-headings:text-gray-900
        prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-900 prose-pre:rounded-xl prose-pre:overflow-x-auto
        prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-primary-400 prose-blockquote:bg-primary-50 prose-blockquote:rounded-r-xl
        prose-img:rounded-xl">
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
          {lesson.content ?? ''}
        </ReactMarkdown>
      </div>

      <div className="pt-2">
        <button
          onClick={onComplete}
          disabled={isCompleting || alreadyDone}
          className={`h-14 w-full rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-sm ${
            alreadyDone
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-60 text-white'
          }`}
        >
          {isCompleting ? (
            <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : alreadyDone ? (
            <>
              <CheckCircle2 size={20} />
              Урок пройден
            </>
          ) : (
            'Урок пройден'
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Quiz lesson ──────────────────────────────────────────────────────────────

interface QuizLessonProps {
  lesson: Lesson
  onComplete: (answers: { questionId: number; selectedOptionIds: number[] }[]) => Promise<void>
  isCompleting: boolean
}

function QuizLesson({ lesson, onComplete, isCompleting }: QuizLessonProps) {
  const questions: QuizQuestion[] = lesson.quizQuestions ?? []
  const [answers, setAnswers] = useState<Record<number, number[]>>({})

  const toggleOption = (questionId: number, optionId: number, multiChoice: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? []
      if (multiChoice) {
        return {
          ...prev,
          [questionId]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        }
      }
      return { ...prev, [questionId]: [optionId] }
    })
  }

  const allAnswered = questions.every((q) => (answers[q.id] ?? []).length > 0)

  const handleSubmit = () => {
    const formatted = questions.map((q) => ({
      questionId: q.id,
      selectedOptionIds: answers[q.id] ?? [],
    }))
    onComplete(formatted)
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {questions
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((q, qi) => {
          const isMulti = q.questionType === 'MULTIPLE_CHOICE'
          const selected = answers[q.id] ?? []

          return (
            <div key={q.id} className="flex flex-col gap-3">
              <p className="font-bold text-gray-900 text-base leading-snug">
                <span className="text-primary-500 mr-1">{qi + 1}.</span>
                {q.questionText}
              </p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => {
                  const isSelected = selected.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(q.id, opt.id, isMulti)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all min-h-[48px] flex items-center gap-3 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:bg-primary-50/30'
                      }`}
                    >
                      <span className={`inline-flex flex-shrink-0 w-5 h-5 rounded-full border-2 items-center justify-center ${
                        isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <span className="w-2 h-2 bg-white rounded-full" />}
                      </span>
                      {opt.optionText}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || isCompleting}
        className="h-14 w-full rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-sm mt-2"
      >
        {isCompleting ? (
          <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'Проверить'
        )}
      </button>
      {!allAnswered && (
        <p className="text-center text-xs text-gray-400">Ответь на все вопросы, чтобы продолжить</p>
      )}
    </div>
  )
}

// ─── Code lesson (PRACTICE / PROJECT) ────────────────────────────────────────

interface CodeLessonProps {
  lesson: Lesson
  onComplete: (code: string) => Promise<void>
  isCompleting: boolean
}

function CodeLesson({ lesson, onComplete, isCompleting }: CodeLessonProps) {
  const task = lesson.codeTasks?.[0]
  const [code, setCode] = useState(task?.initialCode ?? '')
  const [output, setOutput] = useState<string | null>(null)
  const [runError, setRunError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleRun = useCallback(async () => {
    setIsRunning(true)
    setOutput(null)
    setRunError(null)
    try {
      const res = await runCode({ code, language: 'python' })
      setOutput(res.output)
      if (res.error) setRunError(res.error)
    } catch {
      setRunError('Ошибка выполнения кода')
    } finally {
      setIsRunning(false)
    }
  }, [code])

  const handleSubmit = useCallback(async () => {
    await onComplete(code)
  }, [code, onComplete])

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Task description */}
      {task && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-bold text-blue-800 mb-1">Задание</p>
          <p className="text-sm text-blue-700 leading-relaxed">{task.description}</p>
        </div>
      )}

      {/* Hint toggle */}
      {task?.hint && (
        <div>
          <button
            onClick={() => setShowHint((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-amber-600 font-medium"
          >
            <Lightbulb size={16} />
            {showHint ? 'Скрыть подсказку' : 'Показать подсказку'}
          </button>
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                  {task.hint}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Code editor */}
      <div className="rounded-xl overflow-hidden border border-gray-700 shadow-lg">
        <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-xs text-gray-400 font-mono">main.py</span>
        </div>
        <CodeMirror
          value={code}
          onChange={setCode}
          extensions={[python()]}
          theme="dark"
          height="300px"
          className="text-sm"
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            autocompletion: true,
          }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex-1 h-12 rounded-xl bg-gray-800 hover:bg-gray-900 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          {isRunning ? (
            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Play size={16} />
              Запустить
            </>
          )}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isCompleting}
          className="flex-1 h-12 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          {isCompleting ? (
            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send size={16} />
              Отправить
            </>
          )}
        </button>
      </div>

      {/* Output console */}
      <AnimatePresence>
        {(output !== null || runError !== null) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gray-950 rounded-xl overflow-hidden border border-gray-700"
          >
            <div className="px-4 py-2 bg-gray-900 border-b border-gray-700">
              <span className="text-xs font-mono text-gray-400">Вывод</span>
            </div>
            <div className="px-4 py-3 font-mono text-sm min-h-[60px] max-h-48 overflow-y-auto">
              {output && (
                <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
              )}
              {runError && (
                <pre className="text-red-400 whitespace-pre-wrap">{runError}</pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main LessonPage ──────────────────────────────────────────────────────────

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const updateUser = useAuthStore((s) => s.updateUser)
  const user = useAuthStore((s) => s.user)

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [result, setResult] = useState<LessonCompleteResponse | null>(null)

  useEffect(() => {
    if (!lessonId) return
    setIsLoading(true)
    setError(null)
    fetchLesson(Number(lessonId))
      .then(setLesson)
      .catch(() => setError('Не удалось загрузить урок. Попробуй позже.'))
      .finally(() => setIsLoading(false))
  }, [lessonId])

  const handleComplete = useCallback(
    async (extra?: { quizAnswers?: { questionId: number; selectedOptionIds: number[] }[]; code?: string }) => {
      if (!lessonId) return
      setIsCompleting(true)
      setError(null)
      try {
        const res = await completeLesson(Number(lessonId), {
          quizAnswers: extra?.quizAnswers,
          code: extra?.code,
        })
        setResult(res)
        if (user) {
          updateUser({
            xp: user.xp + res.xpEarned,
            bytesBalance: user.bytesBalance + res.bytesEarned,
            ...(res.newLevel ? { level: res.newLevel } : {}),
          })
        }
      } catch {
        setError('Не удалось завершить урок. Попробуй позже.')
      } finally {
        setIsCompleting(false)
      }
    },
    [lessonId, user, updateUser],
  )

  const handleTheoryComplete = useCallback(() => handleComplete(), [handleComplete])

  const handleQuizComplete = useCallback(
    (answers: { questionId: number; selectedOptionIds: number[] }[]) =>
      handleComplete({ quizAnswers: answers }),
    [handleComplete],
  )

  const handleCodeComplete = useCallback(
    (code: string) => handleComplete({ code }),
    [handleComplete],
  )

  const handleRetry = () => setResult(null)

  if (isLoading) {
    return (
      <div className="pb-6">
        <LessonSkeleton />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="text-5xl">😕</div>
        <p className="text-gray-500">{error ?? 'Урок не найден'}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-8"
    >
      <LessonHeader lesson={lesson} courseId={courseId ?? ''} />

      {lesson.lessonType === 'THEORY' && (
        <TheoryLesson
          lesson={lesson}
          onComplete={handleTheoryComplete}
          isCompleting={isCompleting}
        />
      )}

      {lesson.lessonType === 'QUIZ' && (
        <QuizLesson
          lesson={lesson}
          onComplete={handleQuizComplete}
          isCompleting={isCompleting}
        />
      )}

      {(lesson.lessonType === 'PRACTICE' || lesson.lessonType === 'PROJECT') && (
        <CodeLesson
          lesson={lesson}
          onComplete={handleCodeComplete}
          isCompleting={isCompleting}
        />
      )}

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 shadow-lg z-40"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result overlay */}
      <AnimatePresence>
        {result && (
          <ResultOverlay
            result={result}
            lessonType={lesson.lessonType}
            courseId={courseId ?? ''}
            onRetry={result.score < 50 ? handleRetry : undefined}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
