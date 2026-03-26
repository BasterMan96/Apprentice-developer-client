import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { registerApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'

interface FormState {
  fullName: string
  login: string
  phone: string
  password: string
  confirmPassword: string
}

const initialForm: FormState = {
  fullName: '',
  login: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [form, setForm] = useState<FormState>(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setField = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const validate = (): string | null => {
    if (!form.fullName.trim()) return 'Введи своё имя'
    if (!form.login.trim()) return 'Придумай логин'
    if (form.password.length < 6) return 'Пароль должен быть не менее 6 символов'
    if (form.password !== form.confirmPassword) return 'Пароли не совпадают'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    try {
      const { token, user } = await registerApi({
        fullName: form.fullName.trim(),
        login: form.login.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      })
      login(token, user)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message ?? 'Не удалось зарегистрироваться. Попробуй ещё раз.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-orange-100 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="text-6xl mb-3">🤖</div>
          <h1 className="text-3xl font-extrabold text-primary-600 tracking-tight">Байтик</h1>
          <p className="text-gray-500 text-sm mt-1">Начни своё путешествие в мир кода!</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Создать аккаунт</h2>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Полное имя <span className="text-red-400">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Иван Иванов"
                value={form.fullName}
                onChange={setField('fullName')}
                className="h-12 rounded-xl border border-gray-300 px-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
              />
            </div>

            {/* Login */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-login" className="text-sm font-medium text-gray-700">
                Логин <span className="text-red-400">*</span>
              </label>
              <input
                id="reg-login"
                type="text"
                autoComplete="username"
                placeholder="Логин"
                value={form.login}
                onChange={setField('login')}
                className="h-12 rounded-xl border border-gray-300 px-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
              />
            </div>

            {/* Phone (optional) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Телефон{' '}
                <span className="text-gray-400 font-normal">(необязательно)</span>
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+7 999 000 00 00"
                value={form.phone}
                onChange={setField('phone')}
                className="h-12 rounded-xl border border-gray-300 px-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-sm font-medium text-gray-700">
                Пароль <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Не менее 6 символов"
                  value={form.password}
                  onChange={setField('password')}
                  className="h-12 w-full rounded-xl border border-gray-300 px-4 pr-12 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Повтори пароль <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Повтори пароль"
                  value={form.confirmPassword}
                  onChange={setField('confirmPassword')}
                  className="h-12 w-full rounded-xl border border-gray-300 px-4 pr-12 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  aria-label={showConfirm ? 'Скрыть пароль' : 'Показать пароль'}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-60 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-sm mt-1"
            >
              {isLoading ? (
                <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Зарегистрироваться
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
