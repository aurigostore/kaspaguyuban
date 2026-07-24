import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData, fmtRp, fmtTanggal, bulanLabel } from '../context/DataContext.jsx'

export default function Dashboard() {
  const { settings, transaksi, tagihan, siswaList, getDashboard } = useData()

  const now = new Date()
  const bulanIni = now.getMonth() + 1
  const tahunIni = now.getFullYear()

  const { saldo, allIncome, allExpense, masukBulanIni, keluarBulanIni, lunas, sebagian, belum, total } = getDashboard(bulanIni, tahunIni)

  const pctLunas = total > 0 ? Math.round((lunas / total) * 100) : 0

  // 5 transaksi terakhir
  const recentTrx = [...transaksi]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  function getSiswaName(siswaId) {
    const s = siswaList.find(x => x.id === siswaId)
    return s ? s.nama : '—'
  }

  const bLabel = bulanLabel(bulanIni, tahunIni)

  // Info rekening
  const rekInfo = settings.noRekening
    ? `${settings.namaBank} ${settings.noRekening} a.n. ${settings.atasNama}`
    : null

  return (
    <main className="page page--home stack-lg">
      {/* Hero */}
      <section className="hero">
        <p className="hero__eyebrow">Transparansi kas kelas</p>
        <h2 className="hero__title">Assalamu'alaikum, Wali Murid</h2>
        <p className="hero__sub">
          Pantau saldo, status iuran paguyuban, dan pemakaian kas secara terbuka.
        </p>
      </section>

      {/* Saldo — KUNING */}
      <section className="card card--saldo-hero card--yellow" aria-label="Saldo kas">
        <p className="card-label">Saldo kas saat ini</p>
        <p className="saldo-amount">{fmtRp(saldo)}</p>
        <div className="saldo-split">
          <div className="saldo-split__item saldo-split__item--in">
            <span className="k">Total masuk</span>
            <span className="v">{fmtRp(allIncome)}</span>
          </div>
          <div className="saldo-split__item saldo-split__item--out">
            <span className="k">Total keluar</span>
            <span className="v">{fmtRp(allExpense)}</span>
          </div>
        </div>
        <div className="saldo-foot">
          <span>{siswaList.filter(s => s.aktif).length} wali murid aktif</span>
          <span>TA {settings.tahunAjaran}</span>
        </div>
      </section>

      {/* Stat bulan ini */}
      <section className="grid-2">
        <div className="card stat-card stat-card--icon card--cyan">
          <div className="stat-icon stat-icon--in" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </div>
          <div>
            <p className="card-label">Masuk bulan ini</p>
            <p className="stat-value amount-in">{fmtRp(masukBulanIni)}</p>
            <p className="stat-hint">Iuran + pemasukan lain</p>
          </div>
        </div>
        <div className="card stat-card stat-card--icon card--purple">
          <div className="stat-icon stat-icon--out" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
          <div>
            <p className="card-label">Keluar bulan ini</p>
            <p className="stat-value amount-out">{fmtRp(keluarBulanIni)}</p>
            <p className="stat-hint">Pengeluaran kas</p>
          </div>
        </div>
      </section>

      {/* Progress iuran — CYAN-LIGHT */}
      <section className="card card--progress-rich card--cyan-light">
        <div className="progress-block">
          <div className="progress-head">
            <strong>Iuran {bLabel}</strong>
            <span>{fmtRp(settings.nominalIuran)} / wali murid</span>
          </div>
          <div className="progress" aria-hidden="true">
            <i style={{ width: `${pctLunas}%` }}></i>
          </div>
          <p className="stat-hint" style={{ marginTop: 10 }}>
            <strong style={{ color: 'var(--text-primary)' }}>{pctLunas}%</strong>{' '}
            wali murid sudah melunasi iuran bulan ini
          </p>
        </div>
        <div className="progress-stats">
          <div className="progress-stat progress-stat--ok">
            <span className="n">{lunas}</span>
            <span className="l">Lunas</span>
          </div>
          <div className="progress-stat progress-stat--warn">
            <span className="n">{sebagian}</span>
            <span className="l">Sebagian</span>
          </div>
          <div className="progress-stat progress-stat--mute">
            <span className="n">{belum}</span>
            <span className="l">Belum</span>
          </div>
        </div>
        <Link to="/status" className="btn btn--primary btn--block" style={{ marginTop: 14 }}>
          Lihat daftar status iuran
        </Link>
      </section>

      {/* Akses cepat */}
      <section>
        <div className="section-head">
          <h2>Akses cepat</h2>
        </div>
        <div className="shortcut-grid">
          <Link to="/status" className="shortcut shortcut--yellow">
            <span className="shortcut__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </span>
            <span className="shortcut__text">
              <strong>Cek iuran</strong>
              <span>Lunas / belum</span>
            </span>
          </Link>
          <Link to="/riwayat" className="shortcut shortcut--cyan">
            <span className="shortcut__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </span>
            <span className="shortcut__text">
              <strong>Riwayat</strong>
              <span>Masuk &amp; keluar</span>
            </span>
          </Link>
          {rekInfo && (
            <a href="#rekening" className="shortcut shortcut--cyan">
              <span className="shortcut__icon shortcut__icon--bank" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 10h18M5 10V20M19 10V20M3 20h18M12 4l9 6H3l9-6z" />
                </svg>
              </span>
              <span className="shortcut__text">
                <strong>No. rekening</strong>
                <span>Transfer kas</span>
              </span>
            </a>
          )}
          <Link to="/riwayat" className="shortcut shortcut--purple">
            <span className="shortcut__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 2" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
            <span className="shortcut__text">
              <strong>Bulan ini</strong>
              <span>Ringkas transaksi</span>
            </span>
          </Link>
        </div>
      </section>

      {/* Rekening transfer */}
      {rekInfo && (
        <section id="rekening">
          <div className="section-head">
            <h2>Transfer iuran</h2>
            <span className="badge badge--info">Rekening kas</span>
          </div>
          <div className="card card--bank">
            <div className="bank-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10h18M5 10V20M19 10V20M3 20h18M12 4l9 6H3l9-6z" />
              </svg>
            </div>
            <div className="bank-body">
              <p className="bank-name">{settings.namaBank}</p>
              <p className="bank-owner">a.n. {settings.atasNama}</p>
              <div className="bank-rek">
                <span>{settings.noRekening}</span>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(settings.noRekening).catch(() => {})
                  }}
                >
                  Salin
                </button>
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Setelah transfer, konfirmasi ke bendahara di grup WhatsApp kelas.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Aktivitas terbaru */}
      <section>
        <div className="section-head">
          <h2>Aktivitas terbaru</h2>
          <Link to="/riwayat" className="btn btn--ghost btn--sm">Lihat semua</Link>
        </div>
        {recentTrx.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            <p>Belum ada transaksi</p>
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
                        : t.tipe === 'pemasukan_lain'
                        ? t.keterangan
                        : t.keterangan}
                    </p>
                    <p className="list-item__sub">
                      {fmtTanggal(t.tanggal)} ·{' '}
                      {t.tipe === 'iuran' ? t.metode : t.tipe === 'pemasukan_lain' ? 'Pemasukan lain' : t.kategori}
                    </p>
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
      </section>

      {/* Trust note */}
      <section className="trust-note" aria-label="Catatan transparansi">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <div>
          Data kas dikelola ketua &amp; bendahara paguyuban. Halaman ini bersifat terbuka untuk
          transparansi seluruh wali murid {settings.namaPaguyuban}.
        </div>
      </section>
    </main>
  )
}
