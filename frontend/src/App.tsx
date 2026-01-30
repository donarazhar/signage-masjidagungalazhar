import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MainDisplay from "./components/display/MainDisplay";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import PrayerSettings from "./components/admin/PrayerSettings";
import ContentManager from "./components/admin/ContentManager";
import RunningTextManager from "./components/admin/RunningTextManager";
import DonationManager from "./components/admin/DonationManager";
import EventManager from "./components/admin/EventManager";
import HadithManager from "./components/admin/HadithManager";
import MosqueManager from "./components/admin/superadmin/MosqueManager";
import UserManager from "./components/admin/superadmin/UserManager";
import ActivityLog from "./components/admin/superadmin/ActivityLog";
import BackupManager from "./components/admin/superadmin/BackupManager";

import Login from "./components/admin/Login";
import { useAuth } from "./hooks/useAuth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/display" element={<MainDisplay />} />
        <Route path="/display/:mosqueSlug" element={<MainDisplay />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Panel (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* Admin Masjid Routes */}
          <Route path="prayer-settings" element={<PrayerSettings />} />
          <Route path="contents" element={<ContentManager />} />
          <Route path="events" element={<EventManager />} />
          <Route path="running-texts" element={<RunningTextManager />} />
          <Route path="hadiths" element={<HadithManager />} />
          <Route path="donations" element={<DonationManager />} />

          {/* Super Admin Routes */}
          <Route path="mosques" element={<MosqueManager />} />

          <Route path="users" element={<UserManager />} />
          <Route path="activity-log" element={<ActivityLog />} />
          <Route path="backups" element={<BackupManager />} />
        </Route>

        {/* Dynamic Mosque Slug - Must be last */}
        <Route path="/:mosqueSlug" element={<MainDisplay />} />
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
