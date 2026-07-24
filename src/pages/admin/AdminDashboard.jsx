import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData, fmtRp, fmtTanggal, bulanLabel } from '../../context/DataContext.jsx'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { settings, transaksi, tagihan, siswaList, getDashboard } = useData()
  const navigate = useNavigate()

  const now = new Date()
  const bulanIni = now.getMonth() + 1
  const tahunIni = now.getFullYear()

  const { saldo, allIncome, allExpense, masukBulanIni, keluarBulanIni, lunas, sebagian, belum, total } = getDashboard(bulanIni, tahunIni)

  // Siswa yang perlu perhatian (belum/sebagian bulan ini)
  const perluPerhatian = tagihan
    .filter(t => t.bulan === bulanIni && t.tahun === tahunIni && t.status !== 'LUNAS')
    .map(t => {
      const siswa = siswaList.find(s => s.id === t.siswaId)
      return { ...t, nama: siswa?.nama || '—' }
    })
    .slice(0, 5)

  // 3 transaksi terakhir
  const recentTrx = [...transaksi]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)

  function getSiswaName(id) {
    const s = siswaList.find(x => x.id === id)
    return s ? s.nama : '—'
  }

  const bLabel = bulanLabel(bulanIni, tahunIni)

  return (
    <div className="stack-lg">
      {/* Admin top */}
      <div className="admin-top">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-desc" style={{ marginBottom: 0 }}>
            Selamat datang, <strong>{user?.nama}</strong>. Ringkas kas &amp; pintasan bendahara.
          </p>
        </div>
        <div className="quick-actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={() => navigate('/admin/bayar')}>
            + Bayar iuran
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => navigate('/admin/pengeluaran')}>
            + Pengeluaran
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => navigate('/admin/pemasukan')}>
            + Pemasukan lain
          </button>
        </div>
      </div>

      {/* Saldo */}
      <div className="card card--saldo card--yellow">
        <p className="card-label">Saldo kas</p>
        <p className="saldo-amount">{fmtRp(saldo)}</p>
        <div className="meta-line">
          <span>+ {fmtRp(allIncome)} total masuk</span>
          <span>− {fmtRp(allExpense)} total keluar</span>
        </div>
      </div>

      {/* Stats bulan ini */}
      <div className="grid-2">
        <div className="card stat-card card--cyan">
          <div>
            <p className="card-label">Iuran {bLabel}</p>
            <p className="stat-value">{lunas} / {total}</p>
            <p className="stat-hint">wali murid sudah lunas</p>
          </div>
        </div>
        <div className="card stat-card card--yellow">
          <div>
            <p className="card-label">Belum bayar</p>
            <p className="stat-value" style={{ fontSize: '1.3rem' }}>{belum + sebagian}</p>
            <p className="stat-hint">termasuk sebagian</p>
          </div>
        </div>
      </div>

      {/* Masuk/keluar bulan ini */}
      <div className="grid-2">
        <div className="card stat-card card--cyan">
          <div>
            <p className="card-label">Masuk {bLabel}</p>
            <p className="stat-value" style={{ fontSize: '1rem' }}>{fmtRp(masukBulanIni)}</p>
          </div>
        </div>
        <div className="card stat-card card--purple">
          <div>
            <p className="card-label">Keluar {bLabel}</p>
            <p className="stat-value" style={{ fontSize: '1rem' }}>{fmtRp(keluarBulanIni)}</p>
          </div>
        </div>
      </div>

      {/* Perlu perhatian */}
      {perluPerhatian.length > 0 && (
        <div>
          <h2 className="section-label">Perlu perhatian — {bLabel}</h2>
          <div className="list">
            {perluPerhatian.map(t => (
              <div key={t.id} className="list-item">
                <div className="list-item__main">
                  <p className="list-item__title">{t.nama}</p>
                  <p className="list-item__sub">
                    {t.status === 'SEBAGIAN'
                      ? `Kurang ${fmtRp(t.nominal - t.totalBayar)}`
                      : `Belum bayar ${bLabel}`}
                  </p>
                </div>
                <span className={`badge badge--${t.status === 'SEBAGIAN' ? 'sebagian' : 'belum'}`}>
                  {t.status === 'SEBAGIAN' ? 'Sebagian' : 'Belum'}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <Link to="/admin/bayar" className="btn btn--ghost btn--sm">
              Catat pembayaran →
            </Link>
          </div>
        </div>
      )}

      {/* Aktivitas terbaru */}
      <div>
        <div className="section-head">
          <h2>Aktivitas terbaru</h2>
          <Link to="/riwayat" className="btn btn--ghost btn--sm">Lihat semua</Link>
        </div>
        {recentTrx.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada transaksi. Mulai dengan mencatat pembayaran iuran.</p>
          </div>
        ) : (
          <div className="list">
            {recentTrx.map(t => (
              <div key={t.id} className="list-item list-item--activity">
                <div className="list-item__main">
                  <span className={`activity-icon activity-icon--${t.tipe === 'pengeluaran' ? 'out' : 'in'}`} aria-hidden="true">
                    {t.tipe === 'pengeluaran' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                    )}
                  </span>
                  <div>
                    <p className="list-item__title">
                      {t.tipe === 'iuran'
                        ? `Iuran · ${getSiswaName(t.siswaId)}`
                        : t.tipe === 'pemasukan_lain' ? t.keterangan : t.keterangan}
                    </p>
                    <p className="list-item__sub">{fmtTanggal(t.tanggal)}</p>
                  </div>
                </div>
                <div className="list-item__right">
                  <span className={t.tipe === 'pengeluaran' ? 'amount-out' : 'amount-in'}>
                    {t.tipe === 'pengeluaran' ? '− ' : '+ '}{fmtRp(t.nominal)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
