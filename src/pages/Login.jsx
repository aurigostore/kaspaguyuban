import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('Username dan password wajib diisi.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const ok = login(username, password)
      setLoading(false)
      if (ok) {
        navigate('/admin', { replace: true })
      } else {
        setError('Username atau password salah.')
      }
    }, 400)
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        {/* Brand */}
        <div className="login-card__brand">
          <div className="brand-mark" aria-hidden="true">SBH</div>
          <div>
            <p className="login-card__title">Login Admin</p>
            <p className="login-card__sub">Kas Paguyuban SAID BIN HARITS</p>
          </div>
        </div>

        {error && (
          <div className="login-error" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="stack" noValidate>
          <div className="field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="input"
              type="text"
              autoComplete="username"
              placeholder="ketua / bendahara"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="input"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.11 1 12c.69-1.76 1.83-3.33 3.27-4.57M9.9 4.24A9.12 9.12 0 0 1 12 4c5 0 9.27 3.89 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Memuat…' : 'Masuk'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'var(--accent)', fontWeight: 700 }}>← Kembali ke halaman publik</Link>
        </div>
      </div>
    </div>
  )
}
