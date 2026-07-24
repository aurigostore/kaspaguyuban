import { useState, useMemo } from 'react'
import { useData, fmtRp, fmtTanggal, bulanOptions, bulanLabel } from '../../context/DataContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function Laporan() {
  const { settings, transaksi, siswaList, tagihan, getDashboard } = useData()
  const { addToast } = useToast()

  const options = bulanOptions(settings.tahunAjaran, settings.bulanMulai || 7)
  const now = new Date()
  const defaultIdx = (() => {
    const idx = options.findIndex(o => o.bulan === now.getMonth() + 1 && o.tahun === now.getFullYear())
    return idx >= 0 ? idx : 0
  })()

  const [periodeIdx, setPeriodeIdx] = useState(defaultIdx >= 0 ? defaultIdx : 0)
  const [periodeMode, setPeriodeMode] = useState('bulan') // 'bulan' | 'tahun'

  const selected = options[periodeIdx]

  const { masukBulanIni: masukPeriode, keluarBulanIni: keluarPeriode } = getDashboard(
    selected?.bulan, selected?.tahun
  )
  const { saldo } = getDashboard()

  // Transaksi periode yang dipilih
  const trxPeriode = useMemo(() => {
    if (periodeMode === 'tahun') return [...transaksi].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    if (!selected) return []
    return transaksi
      .filter(t => {
        const d = new Date(t.tanggal)
        return d.getMonth() + 1 === selected.bulan && d.getFullYear() === selected.tahun
      })
      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
  }, [transaksi, selected, periodeMode])

  const totalMasuk  = trxPeriode.filter(t => t.tipe !== 'pengeluaran').reduce((s, t) => s + t.nominal, 0)
  const totalKeluar = trxPeriode.filter(t => t.tipe === 'pengeluaran').reduce((s, t) => s + t.nominal, 0)

  function getSiswaName(id) {
    const s = siswaList.find(x => x.id === id)
    return s ? s.nama : '—'
  }

  // ── Export Excel (CSV sederhana) ──────────────────────────────
  function exportCSV() {
    const rows = [
      ['Tanggal', 'Jenis', 'Keterangan / Siswa', 'Kategori', 'Metode', 'Nominal'],
      ...trxPeriode.map(t => [
        fmtTanggal(t.tanggal),
        t.tipe === 'iuran' ? 'Iuran' : t.tipe === 'pemasukan_lain' ? 'Pemasukan Lain' : 'Pengeluaran',
        t.tipe === 'iuran' ? getSiswaName(t.siswaId) : t.keterangan || '',
        t.kategori || '',
        t.metode || '',
        t.tipe === 'pengeluaran' ? -t.nominal : t.nominal,
      ]),
      [],
      ['', '', '', '', 'Total Masuk', totalMasuk],
      ['', '', '', '', 'Total Keluar', totalKeluar],
      ['', '', '', '', 'Selisih', totalMasuk - totalKeluar],
    ]

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `Laporan-Kas-${settings.namaPaguyuban}-${periodeMode === 'tahun' ? settings.tahunAjaran : selected?.label || ''}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast('File Excel (CSV) berhasil diunduh!', 'success')
  }

  // ── Export PDF (print) ────────────────────────────────────────
  function exportPDF() {
    const periodeLabel = periodeMode === 'tahun'
      ? `Tahun Ajaran ${settings.tahunAjaran}`
      : selected?.label || ''

    const rows = trxPeriode.map(t => `
      <tr>
        <td>${fmtTanggal(t.tanggal)}</td>
        <td>${t.tipe === 'iuran' ? 'Iuran' : t.tipe === 'pemasukan_lain' ? 'Pemasukan Lain' : 'Pengeluaran'}</td>
        <td>${t.tipe === 'iuran' ? getSiswaName(t.siswaId) : t.keterangan || ''}</td>
        <td style="text-align:right; color:${t.tipe === 'pengeluaran' ? '#555555' : '#7c4a00'}">
          ${t.tipe === 'pengeluaran' ? '− ' : '+ '}${fmtRp(t.nominal)}
        </td>
      </tr>
    `).join('')

    const html = `<!DOCTYPE html>
<html lang="id"><head>
<meta charset="UTF-8"/>
<title>Laporan Kas — ${settings.namaPaguyuban}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; margin: 32px; color: #1A1A1A; }
  h1  { font-size: 18px; margin-bottom: 4px; }
  p   { margin: 0 0 4px; color: #555; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th, td { padding: 8px 10px; border: 1px solid #E2E8F0; text-align: left; }
  th { background: #FFF8E1; font-weight: 700; }
  .summary { margin-top: 20px; padding: 12px 16px; background: #F5F5F5; border: 1px solid #ddd; }
  .summary p { font-size: 13px; margin-bottom: 6px; }
</style>
</head><body>
<h1>Laporan Kas Paguyuban</h1>
<p>${settings.namaPaguyuban}</p>
<p>Periode: ${periodeLabel} · Dicetak: ${new Date().toLocaleDateString('id-ID')}</p>

<table>
  <thead>
    <tr><th>Tanggal</th><th>Jenis</th><th>Keterangan / Siswa</th><th>Nominal</th></tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<div class="summary">
  <p>Total Masuk: <strong style="color:#7c4a00">${fmtRp(totalMasuk)}</strong></p>
  <p>Total Keluar: <strong style="color:#555555">${fmtRp(totalKeluar)}</strong></p>
  <p>Selisih Periode: <strong>${fmtRp(totalMasuk - totalKeluar)}</strong></p>
  <p>Saldo Kas Keseluruhan: <strong>${fmtRp(saldo)}</strong></p>
</div>
</body></html>`

    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.print()
    addToast('Halaman print dibuka. Simpan sebagai PDF.', 'info')
  }

  // Rekap iuran per siswa untuk bulan terpilih
  const rekapIuran = useMemo(() => {
    if (!selected || periodeMode === 'tahun') return []
    return siswaList.filter(s => s.aktif).map(s => {
      const t = tagihan.find(x => x.siswaId === s.id && x.bulan === selected.bulan && x.tahun === selected.tahun)
      return {
        id: s.id,
        nama: s.nama,
        nominal: t ? t.nominal : settings.nominalIuran,
        totalBayar: t ? t.totalBayar : 0,
        status: t ? t.status : 'BELUM',
      }
    })
  }, [selected, periodeMode, siswaList, tagihan, settings.nominalIuran])

  return (
    <div className="stack-lg">
      <div className="admin-top">
        <div>
          <h1 className="page-title">Laporan &amp; Export</h1>
          <p className="page-desc" style={{ marginBottom: 0 }}>Unduh rekap untuk rapat paguyuban.</p>
        </div>
      </div>

      {/* Pilih periode */}
      <div className="card stack">
        <div className="chips">
          {['bulan', 'tahun'].map(m => (
            <button key={m} type="button" className={`chip${periodeMode === m ? ' is-active' : ''}`} onClick={() => setPeriodeMode(m)}>
              {m === 'bulan' ? 'Per bulan' : `Tahun ajaran ${settings.tahunAjaran}`}
            </button>
          ))}
        </div>

        {periodeMode === 'bulan' && (
          <div className="field">
            <label htmlFor="laporan-bulan">Bulan</label>
            <select
              id="laporan-bulan"
              className="select"
              value={periodeIdx}
              onChange={e => setPeriodeIdx(Number(e.target.value))}
            >
              {options.map((o, i) => (
                <option key={i} value={i}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid-2">
          <button className="btn btn--primary" type="button" onClick={exportCSV}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export Excel (CSV)
          </button>
          <button className="btn btn--secondary" type="button" onClick={exportPDF}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" />
            </svg>
            Export PDF (Print)
          </button>
        </div>
      </div>

      {/* Ringkasan periode */}
      <div className="card">
        <p className="card-label" style={{ marginBottom: 12 }}>
          Preview — {periodeMode === 'tahun' ? `TA ${settings.tahunAjaran}` : selected?.label}
        </p>
        <div className="meta-line" style={{ marginBottom: 12 }}>
          <span className="in">Masuk {fmtRp(totalMasuk)}</span>
          <span className="out">Keluar {fmtRp(totalKeluar)}</span>
        </div>
        <p style={{ fontSize: 18, fontWeight: 700 }}>Selisih periode: {fmtRp(totalMasuk - totalKeluar)}</p>
        <hr className="divider" />
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {trxPeriode.length} transaksi tercatat pada periode ini.
        </p>
      </div>

      {/* Rekap iuran per siswa (mode bulan) */}
      {periodeMode === 'bulan' && rekapIuran.length > 0 && (
        <div>
          <div className="section-head">
            <h2>Rekap Iuran — {selected?.label}</h2>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Nama Wali Murid</th>
                  <th>Nominal</th>
                  <th>Dibayar</th>
                  <th>Sisa</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rekapIuran.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.nama}</td>
                    <td>{fmtRp(r.nominal)}</td>
                    <td className="amount-in">{fmtRp(r.totalBayar)}</td>
                    <td className={r.totalBayar < r.nominal ? 'amount-out' : 'amount-in'}>
                      {fmtRp(Math.max(0, r.nominal - r.totalBayar))}
                    </td>
                    <td>
                      <span className={`badge badge--${r.status === 'LUNAS' ? 'lunas' : r.status === 'SEBAGIAN' ? 'sebagian' : 'belum'}`}>
                        {r.status === 'LUNAS' ? 'Lunas' : r.status === 'SEBAGIAN' ? 'Sebagian' : 'Belum'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* List transaksi periode */}
      {trxPeriode.length > 0 && (
        <div>
          <div className="section-head">
            <h2>Daftar Transaksi</h2>
          </div>
          <div className="list">
            {trxPeriode.slice(0, 20).map(t => (
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
                      {t.tipe === 'iuran' ? `Iuran · ${getSiswaName(t.siswaId)}` : t.keterangan}
                    </p>
                    <p className="list-item__sub">{fmtTanggal(t.tanggal)}</p>
                  </div>
                </div>
                <span className={t.tipe === 'pengeluaran' ? 'amount-out' : 'amount-in'}>
                  {t.tipe === 'pengeluaran' ? '− ' : '+ '}{fmtRp(t.nominal)}
                </span>
              </div>
            ))}
            {trxPeriode.length > 20 && (
              <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                + {trxPeriode.length - 20} transaksi lainnya (tersedia di export)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
