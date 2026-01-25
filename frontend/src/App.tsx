import { Routes, Route, Navigate } from 'react-router-dom'
import MainDisplay from './components/display/MainDisplay'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './components/admin/Dashboard'
import PrayerSettings from './components/admin/PrayerSettings'
import ContentManager from './components/admin/ContentManager'
import RunningTextManager from './components/admin/RunningTextManager'
import FinancialManager from './components/admin/FinancialManager'
import EventManager from './components/admin/EventManager'
import Login from './components/admin/Login'
import { useAuth } from './hooks/useAuth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Display Mode */}
      <Route path="/" element={<MainDisplay />} />
      <Route path="/display" element={<MainDisplay />} />
      
      {/* Admin Login */}
      <Route path="/admin/login" element={<Login />} />
      
      {/* Admin Panel (Protected) */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="prayer-settings" element={<PrayerSettings />} />
        <Route path="contents" element={<ContentManager />} />
        <Route path="events" element={<EventManager />} />
        <Route path="running-texts" element={<RunningTextManager />} />
        <Route path="financials" element={<FinancialManager />} />
      </Route>
    </Routes>
  )
}

export default App
