import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { LayoutDashboard, CreditCard, BarChart3, Sparkles, LogOut, ChevronDown, Sun, Moon, Menu, X } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses',  label: 'Expenses',  icon: CreditCard },
  { to: '/reports',   label: 'Reports',   icon: BarChart3 },
]

export default function AppLayout() {
  const { user, logout }         = useAuth()
  const { dark, toggle }         = useTheme()
  const navigate                 = useNavigate()
  const [dropOpen, setDropOpen]  = useState(false)
  const [sideOpen, setSideOpen]  = useState(false)
  const dropRef                  = useRef(null)

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleLogout = () => { logout(); navigate('/') }
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
    : 'U'

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-200">
      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-30 w-60 flex flex-col',
        'bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800',
        'transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
        sideOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-xl ai-gradient flex items-center justify-center shadow-sm">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-gray-900 dark:text-gray-100 text-sm">Expense</span>
            <span className="font-display font-bold text-blue-600 text-sm"> Intel</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">Menu</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setSideOpen(false)}
              className={({ isActive }) => clsx('sidebar-item', isActive ? 'sidebar-item-active' : 'sidebar-item-inactive')}>
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="w-8 h-8 rounded-full ai-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.fullName}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {sideOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSideOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 lg:px-6 py-3.5 flex items-center gap-3 flex-shrink-0 transition-colors duration-200">
          <button onClick={() => setSideOpen(true)}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex-1" />

          {/* Theme toggle */}
          <button onClick={toggle}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropRef}>
            <button onClick={() => setDropOpen(d => !d)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="w-7 h-7 rounded-full ai-gradient flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                {user?.fullName?.split(' ')[0]}
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {dropOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-[0_10px_30px_-6px_rgb(0,0,0,0.15)] py-1.5 z-50 animate-slide-down">
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.fullName}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <button onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                  <LogOut size={15} />Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
