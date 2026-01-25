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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="admin-sidebar flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🕌</span>
            <div>
              <h1 className="font-bold text-[var(--text-primary)]">Signage Masjid</h1>
              <p className="text-xs text-[var(--text-muted)]">Admin Panel</p>
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
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[var(--accent-blue)] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
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
        <div className="p-4 border-t border-[var(--border-color)]">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Monitor className="w-5 h-5" />
            Lihat Display
          </a>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--urgent-red)] transition-colors"
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
