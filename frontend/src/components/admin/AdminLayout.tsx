import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  LayoutDashboard, 
  Clock, 
  Image, 
  Type, 
  LogOut,
  Monitor,
  Calendar,
  CreditCard,
  Quote,
  Building2,
  Users,
  Activity,
  Database,
  Shield,
} from 'lucide-react'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const getMenuItems = () => {
    if (user?.role === 'superadmin') {
        return [
            { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
            { path: '/admin/mosques', icon: Building2, label: 'Data Masjid' },
            { path: '/admin/users', icon: Users, label: 'Pengguna' },
            { path: '/admin/activity-log', icon: Activity, label: 'Activity Log' },
            { path: '/admin/backups', icon: Database, label: 'Backup Data' },
        ];
    }

    // Default: Admin Masjid
    return [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/admin/prayer-settings', icon: Clock, label: 'Jadwal Shalat' },
        { path: '/admin/contents', icon: Image, label: 'Kelola Konten' },
        { path: '/admin/events', icon: Calendar, label: 'Agenda Kegiatan' },
        { path: '/admin/running-texts', icon: Type, label: 'Running Text' },
        { path: '/admin/hadiths', icon: Quote, label: 'Hadits / Mutiara' },
        { path: '/admin/donations', icon: CreditCard, label: 'Donasi' },
    ];
  }

  const menuItems = getMenuItems();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--slate-50)' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="logo-area">
          {user?.role === 'superadmin' ? (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--primary-100)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={24} />
            </div>
          ) : (
            <img 
              src={user?.mosque?.logo_url || "/logo-alazhar.png"} 
              alt="Logo" 
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/logo-alazhar.png";
              }}
            />
          )}
          <div>
            <div className="title">
              {user?.role === 'superadmin' ? 'Super Admin' : (user?.mosque?.name || 'Masjid Al Azhar')}
            </div>
            <div className="subtitle">
                {user?.role === 'superadmin' ? 'Panel Kontrol' : 'Panel Admin'}
            </div>
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
          {user?.role !== 'superadmin' && (
            <a
              href={user?.mosque?.slug ? `/${user.mosque.slug}` : `/?mosque_id=${user?.mosque_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-item"
              style={{ marginBottom: '0.5rem' }}
            >
              <Monitor size={20} />
              Lihat Display
            </a>
          )}

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
