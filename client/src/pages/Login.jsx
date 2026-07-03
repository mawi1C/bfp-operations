import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FireIcon, ShieldCheckIcon } from '@heroicons/react/24/solid'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ backgroundColor: '#FFF8F4' }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(#F5CFC0 0.5px, transparent 0.5px),
                          linear-gradient(90deg, #F5CFC0 0.5px, transparent 0.5px)`,
        backgroundSize: '32px 32px'
      }} />

      {/* Blob top left */}
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: 320, height: 320, background: '#FDDDD0', opacity: 0.5, top: -80, left: -80 }} />

      {/* Blob bottom right */}
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: 260, height: 260, background: '#FDDDD0', opacity: 0.4, bottom: -60, right: -60 }} />

      {/* Card */}
      <div className="relative z-10 w-full bg-white rounded-2xl p-9"
        style={{ maxWidth: 400, border: '0.5px solid #F5CFC0' }}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="flex items-center justify-center rounded-xl mb-3"
            style={{ width: 54, height: 54, backgroundColor: '#EA580C' }}>
            <FireIcon style={{ width: 28, height: 28, color: '#fff' }} />
          </div>
          <h1 className="font-semibold text-lg tracking-tight"
            style={{ color: '#1C1917', margin: 0 }}>
            BFP Incident Tracker
          </h1>
          <p className="text-xs mt-1" style={{ color: '#A8A29E', margin: '4px 0 0' }}>
            Bureau of Fire Protection
          </p>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
            style={{ background: '#FFF1EB', border: '0.5px solid #FCD9C4', color: '#C2410C' }}>
            <ShieldCheckIcon style={{ width: 13, height: 13 }} />
            Internal System
          </span>
        </div>

        <hr style={{ border: 'none', borderTop: '0.5px solid #F0EDE9', marginBottom: 24 }} />

        {/* Error */}
        {error && (
          <div className="text-xs px-4 py-2.5 rounded-lg mb-5"
            style={{ background: '#FEF2F2', border: '0.5px solid #FECACA', color: '#DC2626' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716C' }}>
              Email address
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@bfp.gov.ph"
              className="w-full text-sm rounded-lg transition outline-none"
              style={{ padding: '10px 14px', border: '0.5px solid #E7E3DF', backgroundColor: '#FAFAF9', color: '#1C1917' }}
              onFocus={e => e.target.style.borderColor = '#EA580C'}
              onBlur={e => e.target.style.borderColor = '#E7E3DF'}
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716C' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full text-sm rounded-lg transition outline-none"
              style={{ padding: '10px 14px', border: '0.5px solid #E7E3DF', backgroundColor: '#FAFAF9', color: '#1C1917' }}
              onFocus={e => e.target.style.borderColor = '#EA580C'}
              onBlur={e => e.target.style.borderColor = '#E7E3DF'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-sm font-medium rounded-lg transition inline-flex items-center justify-center gap-2"
            style={{
              padding: '11px',
              backgroundColor: loading ? '#F08550' : '#EA580C',
              color: '#fff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#C2410C' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#EA580C' }}
          >
            {loading ? 'Signing in...' : (
              <>
                Sign in
                <ArrowRightIcon style={{ width: 15, height: 15 }} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs mt-7" style={{ color: '#D4CECC' }}>
          Bureau of Fire Protection · Internal System · 2026
        </p>
      </div>
    </div>
  )
}