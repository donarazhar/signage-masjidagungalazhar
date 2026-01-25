import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  LayoutDashboard, 
  Clock, 
  Image, 
  Type, 
  DollarSign, 
  LogOut,
  Monitor
} from 'lucide-react'

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/prayer-settings', icon: Clock, label: 'Lokasi & Jadwal' },
  { path: '/admin/contents', icon: Image, label: 'Kelola Konten' },
  { path: '/admin/running-texts', icon: Type, label: 'Running Text' },
  { path: '/admin/financials', icon: DollarSign, label: 'Keuangan' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-[#f0fdf4]">
      {/* Sidebar */}
      <aside className="admin-sidebar flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo-alazhar.png" alt="Logo" className="h-12 w-auto" />
            <div>
              <h1 className="font-bold text-white text-sm">Masjid Al Azhar</h1>
              <p className="text-xs text-white/60">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white text-[var(--primary-green)] shadow-lg'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Display Preview Link */}
        <div className="p-4 border-t border-white/10">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            <Monitor className="w-5 h-5" />
            Lihat Display
          </a>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-white/60">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-red-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content flex-1">
        <Outlet />
      </main>
    </div>
  )
}
