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
  { path: '/admin/prayer-settings', icon: Clock, label: 'Jadwal Shalat' },
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--slate-50)' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="logo-area">
          <img src="/logo-alazhar.png" alt="Logo" />
          <div>
            <div className="title">Masjid Al Azhar</div>
            <div className="subtitle">Panel Admin</div>
          </div>
        </div>

        {/* Navigation */}
        <nav>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Display Preview */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
            style={{ marginBottom: '0.5rem' }}
          >
            <Monitor size={20} />
            Lihat Display
          </a>

          {/* User Info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0.75rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            marginTop: '0.5rem'
          }}>
            <div>
              <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: 600 }}>
                {user?.name || 'Admin'}
              </div>
              <div style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>
                {user?.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
