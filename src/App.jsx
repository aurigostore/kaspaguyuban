import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

// Public pages
import PublikLayout from './pages/PublikLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import StatusIuran from './pages/StatusIuran.jsx'
import Riwayat from './pages/Riwayat.jsx'

// Admin pages
import Login from './pages/Login.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import WaliMurid from './pages/admin/WaliMurid.jsx'
import BayarIuran from './pages/admin/BayarIuran.jsx'
import Pemasukan from './pages/admin/Pemasukan.jsx'
import Pengeluaran from './pages/admin/Pengeluaran.jsx'
import Laporan from './pages/admin/Laporan.jsx'
import Pengaturan from './pages/admin/Pengaturan.jsx'

function AdminRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <div className="loading-screen">Memuat…</div>
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Publik */}
              <Route path="/" element={<PublikLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="status" element={<StatusIuran />} />
                <Route path="riwayat" element={<Riwayat />} />
              </Route>

              {/* Login */}
              <Route path="/login" element={<Login />} />

              {/* Admin (protected) */}
              <Route path="/admin" element={
                <AdminRoute><AdminLayout /></AdminRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="wali-murid" element={<WaliMurid />} />
                <Route path="bayar" element={<BayarIuran />} />
                <Route path="pemasukan" element={<Pemasukan />} />
                <Route path="pengeluaran" element={<Pengeluaran />} />
                <Route path="laporan" element={<Laporan />} />
                <Route path="pengaturan" element={<Pengaturan />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </DataProvider>
  )
}
