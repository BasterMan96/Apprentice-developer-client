import { NavLink } from 'react-router-dom'
import { Home, BookOpen, GraduationCap, User, Trophy } from 'lucide-react'

const navItems = [
  { to: '/',          label: 'Главная',  Icon: Home },
  { to: '/courses',   label: 'Курсы',    Icon: BookOpen },
  { to: '/learning',  label: 'Учёба',    Icon: GraduationCap },
  { to: '/portfolio', label: 'Портфолио', Icon: Trophy },
  { to: '/profile',   label: 'Профиль',  Icon: User },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-16 bg-white border-t border-gray-200 md:hidden">
      {navItems.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors text-xs font-medium ${
              isActive
                ? 'text-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
