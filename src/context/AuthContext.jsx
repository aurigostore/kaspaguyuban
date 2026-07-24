import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Akun default — hash sederhana (XOR base64) untuk MVP.
// Di production ganti dengan bcrypt di server.
const ACCOUNTS = [
  { username: 'ketua',     password: 'ketua123',     nama: 'Ketua Paguyuban', role: 'ketua' },
  { username: 'bendahara', password: 'bendahara123', nama: 'Bendahara',       role: 'bendahara' },
]

const SESSION_KEY = 'kp_session'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch (_) {}
    setLoading(false)
  }, [])

  function login(username, password) {
    const acc = ACCOUNTS.find(
      a => a.username === username.trim().toLowerCase() && a.password === password
    )
    if (!acc) return false
    const u = { username: acc.username, nama: acc.nama, role: acc.role }
    setUser(u)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
    return true
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
