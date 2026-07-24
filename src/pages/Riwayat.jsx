import { useState, useMemo } from 'react'
import { useData, fmtRp, fmtTanggal, bulanOptions } from '../context/DataContext.jsx'

export default function Riwayat() {
  const { settings, transaksi, siswaList } = useData()

  const options = bulanOptions(settings.tahunAjaran, settings.bulanMulai || 7)

  const now = new Date()
  const [selectedIdx, setSelectedIdx] = useState(-1) // -1 = semua bulan
  const [filterJenis, setFilterJenis] = useState('Semua')

  function getSiswaName(id) {
    const s = siswaList.find(x => x.id === id)
    return s ? s.nama : '—'
  }

  const filtered = useMemo(() => {
    let list = [...transaksi].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal) || new Date(b.createdAt) - new Date(a.createdAt))

    // Filter bulan
    if (selectedIdx >= 0 && options[selectedIdx]) {
      const { bulan, tahun } = options[selectedIdx]
      list = list.filter(t => {
        const d = new Date(t.tanggal)
        return d.getMonth() + 1 === bulan && d.getFullYear() === tahun
      })
    }

    // Filter jenis
    if (filterJenis === 'Pemasukan') {
      list = list.filter(t => t.tipe !== 'pengeluaran')
    } else if (filterJenis === 'Pengeluaran') {
      list = list.filter(t => t.tipe === 'pengeluaran')
    }

    return list
  }, [transaksi, selectedIdx, options, filterJenis])

  const totalMasuk  = filtered.filter(t => t.tipe !== 'pengeluaran').reduce((s, t) => s + t.nominal, 0)
  const totalKeluar = filtered.filter(t => t.tipe === 'pengeluaran').reduce((s, t) => s + t.nominal, 0)

  function getTrxLabel(t) {
    if (t.tipe === 'iuran') return `Iuran · ${getSiswaName(t.siswaId)}`
    if (t.tipe === 'pemasukan_lain') return t.keterangan || 'Pemasukan lain'
    return t.keterangan || 'Pengeluaran'
  }

  function getTrxSub(t) {
    const parts = [fmtTanggal(t.tanggal)]
    if (t.tipe === 'iuran') parts.push(t.metode || '')
    else if (t.tipe === 'pemasukan_lain') parts.push('Pemasukan lain', t.metode || '')
    else parts.push(t.kategori || 'Pengeluaran')
    return parts.filter(Boolean).join(' · ')
  }

  return (
    <main className="page stack-lg">
      <div>
        <h1 className="page-title">Riwayat Transaksi</h1>
        <p className="page-desc">Semua pemasukan dan pengeluaran kas paguyuban.</p>
      </div>

      {/* Filter bulan */}
      <div className="field">
        <label htmlFor="bulan-riwayat">Bulan</label>
        <select
          id="bulan-riwayat"
          className="select"
          value={selectedIdx}
          onChange={e => setSelectedIdx(Number(e.target.value))}
        >
          <option value={-1}>Semua bulan</option>
          {options.map((o, i) => (
            <option key={i} value={i}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Filter jenis chips */}
      <div className="chips">
        {['Semua', 'Pemasukan', 'Pengeluaran'].map(j => (
          <button
            key={j}
            type="button"
            className={`chip${filterJenis === j ? ' is-active' : ''}`}
            onClick={() => setFilterJenis(j)}
          >
            {j}
          </button>
        ))}
      </div>

      {/* Ringkasan */}
      <div className="grid-2">
        <div className="card stat-card card--cyan">
          <div>
            <p className="card-label">Total masuk</p>
            <p className="stat-value" style={{ fontSize: 18 }}>{fmtRp(totalMasuk)}</p>
          </div>
        </div>
        <div className="card stat-card card--purple">
          <div>
            <p className="card-label">Total keluar</p>
            <p className="stat-value" style={{ fontSize: 18 }}>{fmtRp(totalKeluar)}</p>
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          <p>Belum ada transaksi di periode ini.</p>
        </div>
      ) : (
        <div className="list">
          {filtered.map(t => (
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
                  <p className="list-item__title">{getTrxLabel(t)}</p>
                  <p className="list-item__sub">{getTrxSub(t)}</p>
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
    </main>
  )
}
