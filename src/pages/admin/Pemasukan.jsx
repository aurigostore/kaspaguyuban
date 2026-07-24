import { useState } from 'react'
import { useData, fmtRp, fmtTanggal } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function Pemasukan() {
  const { catatPemasukan, transaksi, hapusTransaksi } = useData()
  const { user } = useAuth()
  const { addToast } = useToast()

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const [tanggal, setTanggal]     = useState(todayStr)
  const [nominal, setNominal]     = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [metode, setMetode]       = useState('Transfer')
  const [loading, setLoading]     = useState(false)
  const [errors, setErrors]       = useState({})
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(null)

  // Riwayat pemasukan lain
  const riwayat = transaksi
    .filter(t => t.tipe === 'pemasukan_lain')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  function validate() {
    const e = {}
    if (!nominal || isNaN(Number(nominal)) || Number(nominal) <= 0) e.nominal = 'Masukkan nominal yang valid.'
    if (!keterangan.trim()) e.keterangan = 'Keterangan wajib diisi.'
    if (!tanggal) e.tanggal = 'Tanggal wajib diisi.'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const ev = validate()
    if (Object.keys(ev).length) { setErrors(ev); return }
    setLoading(true)
    setTimeout(() => {
      catatPemasukan({
        tanggal,
        nominal: Number(nominal),
        keterangan: keterangan.trim(),
        metode,
        createdBy: user?.username || 'admin',
      })
      addToast('Pemasukan lain berhasil dicatat!', 'success')
      setNominal('')
      setKeterangan('')
      setTanggal(todayStr)
      setErrors({})
      setLoading(false)
    }, 300)
  }

  function handleHapus(id) {
    hapusTransaksi(id)
    setKonfirmasiHapus(null)
    addToast('Transaksi dihapus.', 'info')
  }

  return (
    <div className="stack-lg">
      <div className="admin-top">
        <div>
          <h1 className="page-title">Pemasukan Lain</h1>
          <p className="page-desc" style={{ marginBottom: 0 }}>Sumbangan, sisa kegiatan, pengembalian, dll.</p>
        </div>
      </div>

      <div className="card stack">
        <form onSubmit={handleSubmit} className="stack" noValidate>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="pm-tanggal">Tanggal *</label>
              <input
                id="pm-tanggal"
                className={`input${errors.tanggal ? ' input--error' : ''}`}
                type="date"
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
                disabled={loading}
              />
              {errors.tanggal && <span className="error-msg">{errors.tanggal}</span>}
            </div>
            <div className="field">
              <label htmlFor="pm-nominal">Nominal (Rp) *</label>
              <input
                id="pm-nominal"
                className={`input${errors.nominal ? ' input--error' : ''}`}
                type="number"
                min="1"
                placeholder="mis. 100000"
                value={nominal}
                onChange={e => setNominal(e.target.value)}
                disabled={loading}
              />
              {errors.nominal && <span className="error-msg">{errors.nominal}</span>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="pm-keterangan">Keterangan *</label>
            <input
              id="pm-keterangan"
              className={`input${errors.keterangan ? ' input--error' : ''}`}
              placeholder="mis. Sumbangan alumni"
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              disabled={loading}
            />
            {errors.keterangan && <span className="error-msg">{errors.keterangan}</span>}
          </div>

          <div className="field">
            <label>Metode (opsional)</label>
            <select
              className="select"
              value={metode}
              onChange={e => setMetode(e.target.value)}
              disabled={loading}
            >
              <option value="Transfer">Transfer</option>
              <option value="Tunai">Tunai</option>
              <option value="">—</option>
            </select>
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Menyimpan…' : 'Simpan pemasukan'}
          </button>
        </form>
      </div>

      {/* Riwayat */}
      <div>
        <div className="section-head">
          <h2>Riwayat Pemasukan Lain</h2>
        </div>
        {riwayat.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada pemasukan lain yang dicatat.</p>
          </div>
        ) : (
          <div className="list">
            {riwayat.map(t => (
              <div key={t.id} className="list-item">
                <div className="list-item__main">
                  <p className="list-item__title">{t.keterangan}</p>
                  <p className="list-item__sub">{fmtTanggal(t.tanggal)}{t.metode ? ` · ${t.metode}` : ''}</p>
                </div>
                <div className="list-item__right">
                  <span className="amount-in">+ {fmtRp(t.nominal)}</span>
                  {konfirmasiHapus === t.id ? (
                    <div className="row" style={{ gap: 4 }}>
                      <button className="btn btn--danger btn--sm" type="button" onClick={() => handleHapus(t.id)}>Ya, hapus</button>
                      <button className="btn btn--ghost btn--sm" type="button" onClick={() => setKonfirmasiHapus(null)}>Batal</button>
                    </div>
                  ) : (
                    <button className="btn btn--ghost btn--sm" type="button" style={{ fontWeight: 700 }} onClick={() => setKonfirmasiHapus(t.id)}>
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
