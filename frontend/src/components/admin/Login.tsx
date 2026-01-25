import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Lock, Mail, LogIn } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      navigate('/admin')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Email atau password salah')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo-alazhar.png" alt="Logo" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--primary-green)]">
            Digital Signage
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Masjid Agung Al Azhar
          </p>
        </div>

        {/* Form Card */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-center text-[var(--text-dark)] mb-6">
            Masuk ke Panel Admin
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                  placeholder="admin@masjid.local"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Masuk
                </span>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-[var(--text-muted)] text-sm">
          <a href="/" className="hover:text-[var(--primary-green)]">
            ← Kembali ke tampilan display
          </a>
        </div>
      </div>
    </div>
  )
}
