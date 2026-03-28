import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Zap, BookOpen, Flame, Trophy, GraduationCap, Layers } from 'lucide-react'
import { motion } from 'framer-motion'
import { fetchProfile, fetchAchievements } from '../api/users'
import { useAuthStore } from '../store/authStore'
import type { UserStats, Achievement } from '../types'

// ─── Shop Items ──────────────────────────────────────────────────────────────

interface ShopItem {
  id: number
  name: string
  price: number
  emoji: string
  description: string
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 1, name: 'Футболка Байтик', price: 500, emoji: '👕', description: 'Белая футболка с логотипом' },
  { id: 2, name: 'Худи Байтик', price: 1000, emoji: '🧥', description: 'Тёплое худи для кодеров' },
  { id: 3, name: 'Стикерпак', price: 100, emoji: '🎨', description: 'Набор из 10 стикеров' },
  { id: 4, name: 'Кружка Python', price: 300, emoji: '☕', description: 'Кружка с змейкой' },
  { id: 5, name: 'Блокнот', price: 200, emoji: '📓', description: 'Для заметок и алгоритмов' },
  { id: 6, name: 'Рюкзак', price: 2000, emoji: '🎒', description: 'Рюкзак программиста' },
]

function ShopCard({ item, userBytes }: { item: ShopItem; userBytes: number }) {
  const canAfford = userBytes >= item.price
  const [bought, setBought] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
      <div className="text-4xl text-center py-2">{item.emoji}</div>
      <h3 className="font-bold text-sm text-gray-900 text-center leading-tight">{item.name}</h3>
      <p className="text-xs text-gray-400 text-center">{item.description}</p>
      <div className="flex items-center justify-center gap-1 text-sm font-bold text-primary-600">
        💎 {item.price} байтов
      </div>
      <button
        onClick={() => { if (canAfford && !bought) setBought(true) }}
        disabled={!canAfford || bought}
        className={`h-10 w-full rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${
          bought
            ? 'bg-green-100 text-green-700'
            : canAfford
              ? 'bg-primary-500 hover:bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {bought ? '✅ Заказано' : canAfford ? 'Обменять' : 'Не хватает'}
      </button>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Backend formula: level = floor(sqrt(xp / 100)) + 1
// So xp threshold for level N: (N-1)^2 * 100
function xpForLevel(level: number) {
  return (level - 1) * (level - 1) * 100
}

function nextLevelXp(level: number) {
  return level * level * 100
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-5 pb-24">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-200" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-5 bg-gray-200 rounded-full w-40" />
          <div className="h-4 bg-gray-100 rounded-full w-24" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded-full" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

// ─── Stats card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  accent?: string
}

function StatCard({ icon, label, value, accent = 'text-primary-600' }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
      <div className="text-gray-400">{icon}</div>
      <p className={`text-xl font-extrabold ${accent}`}>{value}</p>
      <p className="text-xs text-gray-500 leading-tight">{label}</p>
    </div>
  )
}

// ─── Achievement badge ────────────────────────────────────────────────────────

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const earned = !!achievement.earnedAt
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center ${
        earned
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-gray-50 border-gray-100 opacity-50 grayscale'
      }`}
    >
      <span className="text-3xl select-none">{achievement.iconUrl || '🏅'}</span>
      <p className={`text-xs font-bold leading-tight ${earned ? 'text-yellow-800' : 'text-gray-500'}`}>
        {achievement.title}
      </p>
      {earned && achievement.earnedAt && (
        <p className="text-xs text-yellow-500">
          {new Date(achievement.earnedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
        </p>
      )}
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    Promise.all([fetchProfile(), fetchAchievements()])
      .then(([profileRes, achRes]) => {
        setStats(profileRes.stats)
        setAchievements(achRes)
      })
      .catch(() => {
        // fallback: show user from store
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="pb-6">
        <ProfileSkeleton />
      </div>
    )
  }

  const displayUser = user
  if (!displayUser) return null

  const currentLevel = stats?.level ?? displayUser.level
  const totalXp = stats?.totalXp ?? displayUser.xp
  const xpIntoLevel = totalXp - xpForLevel(currentLevel - 1)
  const xpNeeded = nextLevelXp(currentLevel) - xpForLevel(currentLevel - 1)
  const progressPct = Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100))

  const initials = displayUser.fullName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 pb-10"
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex-shrink-0">
          {displayUser.avatarUrl ? (
            <img
              src={displayUser.avatarUrl}
              alt={displayUser.fullName}
              className="w-20 h-20 rounded-full object-cover border-4 border-primary-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-extrabold border-4 border-primary-100">
              {initials}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-extrabold text-gray-900 leading-tight">{displayUser.fullName}</h1>
          <p className="text-sm text-gray-400">@{displayUser.login}</p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 w-fit">
            <Trophy size={12} />
            Уровень {currentLevel}
          </span>
        </div>
      </div>

      {/* Level progress */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Прогресс до уровня {currentLevel + 1}</span>
          <span className="text-sm font-bold text-primary-600">{progressPct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-400 text-right">
          {xpIntoLevel} / {xpNeeded} XP
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Zap size={20} />}
          label="Всего XP"
          value={totalXp}
          accent="text-amber-500"
        />
        <StatCard
          icon={<Trophy size={20} />}
          label="Уровень"
          value={currentLevel}
          accent="text-primary-600"
        />
        <StatCard
          icon={<span className="text-xl select-none">💎</span>}
          label="Байтов"
          value={stats?.bytesBalance ?? displayUser.bytesBalance}
          accent="text-primary-500"
        />
        <StatCard
          icon={<GraduationCap size={20} />}
          label="Курсов пройдено"
          value={stats?.coursesCompleted ?? 0}
          accent="text-green-600"
        />
        <StatCard
          icon={<BookOpen size={20} />}
          label="Уроков пройдено"
          value={stats?.lessonsCompleted ?? 0}
          accent="text-blue-600"
        />
        <StatCard
          icon={<Flame size={20} />}
          label="Дней подряд"
          value={stats?.streak ?? 0}
          accent="text-red-500"
        />
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Достижения</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-600">
              {achievements.filter((a) => a.earnedAt).length}/{achievements.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {achievements.map((a) => (
              <AchievementBadge key={a.id} achievement={a} />
            ))}
          </div>
        </div>
      )}

      {/* Bytes Shop */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛒</span>
          <h2 className="text-lg font-extrabold text-gray-900">Обменник Байтов</h2>
        </div>
        <p className="text-sm text-gray-500">Обменяй заработанные байты на крутой мерч!</p>
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.map((item) => (
            <ShopCard key={item.id} item={item} userBytes={stats?.bytesBalance ?? displayUser.bytesBalance} />
          ))}
        </div>
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-primary-700">🎯 Накопи 10 000 байтов — получи стажировку в IT-компании!</p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="h-12 w-full rounded-xl border-2 border-red-200 text-red-500 font-bold text-base flex items-center justify-center gap-2 hover:bg-red-50 transition-colors mt-2"
      >
        <LogOut size={18} />
        Выйти
      </button>
    </motion.div>
  )
}
