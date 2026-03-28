import { Coins, Bell, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'

export default function Header() {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200 shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-xl font-bold text-primary-500">Байтик</span>
      </Link>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold">
            <Coins size={16} />
            <span>{user.bytesBalance.toLocaleString()}</span>
          </div>
        )}

        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Notifications">
          <Bell size={20} className="text-gray-600" />
        </button>

        <Link to="/profile" className="p-1 rounded-full hover:bg-gray-100 transition-colors" aria-label="Profile">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <User size={16} className="text-primary-600" />
            </div>
          )}
        </Link>
      </div>
    </header>
  )
}
