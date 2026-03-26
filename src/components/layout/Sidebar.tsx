import { NavLink } from 'react-router-dom'
import {
  Home,
  BookOpen,
  GraduationCap,
  User,
  Trophy,
  Award,
  Users,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/',          label: 'Главная',      Icon: Home },
  { to: '/courses',   label: 'Курсы',        Icon: BookOpen },
  { to: '/learning',  label: 'Моя учёба',    Icon: GraduationCap },
  { to: '/portfolio', label: 'Портфолио',    Icon: Trophy },
  { to: '/certificates', label: 'Сертификаты', Icon: Award },
  { to: '/profile',   label: 'Профиль',      Icon: User },
]

const parentNavItems = [
  { to: '/parent',    label: 'Панель родителя', Icon: Users },
]

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const isParent = user?.role === 'PARENT'

  const items = isParent ? [...navItems, ...parentNavItems] : navItems

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-gray-200 pt-4 pb-8">
      <div className="px-6 mb-6">
        <span className="text-2xl font-bold text-primary-500">Bytik</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="px-4 mt-4">
          <div className="p-3 rounded-xl bg-primary-50 border border-primary-100">
            <p className="text-xs text-primary-600 font-medium">Уровень {user.level}</p>
            <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
          </div>
        </div>
      )}
    </aside>
  )
}
