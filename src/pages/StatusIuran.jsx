import { useState, useMemo } from 'react'
import { useData, fmtRp, bulanLabel, bulanOptions } from '../context/DataContext.jsx'

const STATUS_BADGE = {
  LUNAS:    { cls: 'badge--lunas',    label: 'Lunas' },
  SEBAGIAN: { cls: 'badge--sebagian', label: 'Sebagian' },
  BELUM:    { cls: 'badge--belum',    label: 'Belum' },
}

export default function StatusIuran() {
  const { settings, siswaList, tagihan } = useData()

  const options = bulanOptions(settings.tahunAjaran, settings.bulanMulai || 7)

  const now = new Date()
  const defaultIdx = (() => {
    const idx = options.findIndex(o => o.bulan === now.getMonth() + 1 && o.tahun === now.getFullYear())
    return idx >= 0 ? idx : 0
  })()

  const [selectedIdx, setSelectedIdx] = useState(defaultIdx >= 0 ? defaultIdx : 0)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua')

  const selected = options[selectedIdx]

  const rows = useMemo(() => {
    if (!selected) return []
    const aktivSiswa = siswaList.filter(s => s.aktif)
    return aktivSiswa.map(s => {
      const t = tagihan.find(t => t.siswaId === s.id && t.bulan === selected.bulan && t.tahun === selected.tahun)
      return {
        id: s.id,
        nama: s.nama,
        namaWali: s.namaWali || '',
        totalBayar: t ? t.totalBayar : 0,
        nominal: t ? t.nominal : settings.nominalIuran,
        status: t ? t.status : 'BELUM',
      }
    })
  }, [selected, siswaList, tagihan, settings.nominalIuran])

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const q = search.toLowerCase()
      const matchSearch = !q || r.nama.toLowerCase().includes(q) || r.namaWali.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'Semua' || r.status === filterStatus.toUpperCase()
      return matchSearch && matchStatus
    })
  }, [rows, search, filterStatus])

  const lunas    = rows.filter(r => r.status === 'LUNAS').length
  const sebagian = rows.filter(r => r.status === 'SEBAGIAN').length
  const belum    = rows.filter(r => r.status === 'BELUM').length
  const total    = rows.length
  const pct      = total > 0 ? Math.round((lunas / total) * 100) : 0

  return (
    <main className="page stack-lg">
      <div>
        <h1 className="page-title">Status Iuran</h1>
        <p className="page-desc">Transparansi pembayaran kas bulanan per wali murid.</p>
      </div>

      {/* Filter bulan */}
      <div className="field">
        <label htmlFor="bulan-status">Bulan</label>
        <select
          id="bulan-status"
          className="select"
          value={selectedIdx}
          onChange={e => setSelectedIdx(Number(e.target.value))}
        >
          {options.map((o, i) => (
            <option key={i} value={i}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Progress */}
      <div className="card card--cyan-light">
        <div className="progress-block">
          <div className="progress-head">
            <strong>{lunas} lunas · {sebagian} sebagian · {belum} belum</strong>
            <span>{fmtRp(selected ? selected.nominal || settings.nominalIuran : settings.nominalIuran)}/wali murid</span>
          </div>
          <div className="progress">
            <i style={{ width: `${pct}%` }}></i>
          </div>
        </div>
        <div className="progress-stats" style={{ marginTop: 12 }}>
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
      </div>

      {/* Search */}
      <div className="field">
        <label className="hidden" htmlFor="cari-siswa">Cari wali murid</label>
        <input
          id="cari-siswa"
          className="input input--search"
          type="search"
          placeholder="Cari nama wali murid / siswa…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filter chips */}
      <div className="chips" role="tablist" aria-label="Filter status">
        {['Semua', 'Lunas', 'Sebagian', 'Belum'].map(s => (
          <button
            key={s}
            type="button"
            className={`chip${filterStatus === s ? ' is-active' : ''}`}
            onClick={() => setFilterStatus(s)}
            role="tab"
            aria-selected={filterStatus === s}
          >
            {s}
          </button>
        ))}
      </div>

      {/* List */}
      {siswaList.filter(s => s.aktif).length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          <p>Belum ada siswa. Admin dapat menambahkan data siswa.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>Tidak ada hasil untuk filter ini.</p>
        </div>
      ) : (
        <div className="list">
          {filtered.map(r => {
            const badge = STATUS_BADGE[r.status]
            return (
              <div key={r.id} className="list-item">
                <div className="list-item__main">
                  <p className="list-item__title">{r.nama}</p>
                  <p className="list-item__sub">
                    {r.status === 'BELUM'
                      ? 'Belum ada pembayaran'
                      : `Dibayar ${fmtRp(r.totalBayar)}${r.status === 'SEBAGIAN' ? ` / ${fmtRp(r.nominal)}` : ''}`}
                  </p>
                </div>
                <span className={`badge ${badge.cls}`}>{badge.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
