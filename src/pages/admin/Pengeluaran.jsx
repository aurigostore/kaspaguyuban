import { useState } from 'react'
import { useData, fmtRp, fmtTanggal } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function Pengeluaran() {
  const { settings, catatPengeluaran, transaksi, hapusTransaksi } = useData()
  const { user } = useAuth()
  const { addToast } = useToast()

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const kategoriList = settings.kategoriPengeluaran || ['ATK', 'Snack/Konsumsi', 'Dekorasi', 'Transport', 'Hadiah', 'Lain-lain']

  const [tanggal, setTanggal]         = useState(todayStr)
  const [nominal, setNominal]         = useState('')
  const [kategori, setKategori]       = useState(kategoriList[0])
  const [keterangan, setKeterangan]   = useState('')
  const [loading, setLoading]         = useState(false)
  const [errors, setErrors]           = useState({})
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(null)

  // Riwayat pengeluaran
  const riwayat = transaksi
    .filter(t => t.tipe === 'pengeluaran')
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
      catatPengeluaran({
        tanggal,
        nominal: Number(nominal),
        kategori,
        keterangan: keterangan.trim(),
        createdBy: user?.username || 'admin',
      })
      addToast('Pengeluaran berhasil dicatat!', 'success')
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
          <h1 className="page-title">Pengeluaran</h1>
          <p className="page-desc" style={{ marginBottom: 0 }}>Catat belanja kas kelas beserta kategori.</p>
        </div>
      </div>

      <div className="card stack">
        <form onSubmit={handleSubmit} className="stack" noValidate>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="pn-tanggal">Tanggal *</label>
              <input
                id="pn-tanggal"
                className={`input${errors.tanggal ? ' input--error' : ''}`}
                type="date"
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
                disabled={loading}
              />
              {errors.tanggal && <span className="error-msg">{errors.tanggal}</span>}
            </div>
            <div className="field">
              <label htmlFor="pn-nominal">Nominal (Rp) *</label>
              <input
                id="pn-nominal"
                className={`input${errors.nominal ? ' input--error' : ''}`}
                type="number"
                min="1"
                placeholder="mis. 45000"
                value={nominal}
                onChange={e => setNominal(e.target.value)}
                disabled={loading}
              />
              {errors.nominal && <span className="error-msg">{errors.nominal}</span>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="pn-kategori">Kategori</label>
            <select
              id="pn-kategori"
              className="select"
              value={kategori}
              onChange={e => setKategori(e.target.value)}
              disabled={loading}
            >
              {kategoriList.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="pn-keterangan">Keterangan *</label>
            <input
              id="pn-keterangan"
              className={`input${errors.keterangan ? ' input--error' : ''}`}
              placeholder="mis. Snack rapat wali Juli"
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              disabled={loading}
            />
            {errors.keterangan && <span className="error-msg">{errors.keterangan}</span>}
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Menyimpan…' : 'Simpan pengeluaran'}
          </button>
        </form>
      </div>

      {/* Riwayat */}
      <div>
        <div className="section-head">
          <h2>Riwayat Pengeluaran</h2>
        </div>
        {riwayat.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada pengeluaran yang dicatat.</p>
          </div>
        ) : (
          <div className="list">
            {riwayat.map(t => (
              <div key={t.id} className="list-item">
                <div className="list-item__main">
                  <p className="list-item__title">{t.keterangan}</p>
                  <p className="list-item__sub">{fmtTanggal(t.tanggal)} · {t.kategori}</p>
                </div>
                <div className="list-item__right">
                  <span className="amount-out">− {fmtRp(t.nominal)}</span>
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
