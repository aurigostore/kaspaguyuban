import { useState } from 'react'
import { useData, detectTahunAjaran } from '../../context/DataContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function Pengaturan() {
  const { settings, simpanSettings } = useData()
  const { addToast } = useToast()

  const detectedTA = detectTahunAjaran(settings.bulanMulai || 7)
  const taWrong    = settings.tahunAjaran !== detectedTA

  const [form, setForm] = useState({
    namaPaguyuban: settings.namaPaguyuban,
    tahunAjaran:   settings.tahunAjaran,
    nominalIuran:  String(settings.nominalIuran),
    namaBank:      settings.namaBank || '',
    noRekening:    settings.noRekening || '',
    atasNama:      settings.atasNama || '',
    kategoriPengeluaran: (settings.kategoriPengeluaran || []).join(', '),
  })

  const [loading, setLoading]           = useState(false)
  const [errors,  setErrors]            = useState({})
  const [confirmReset, setConfirmReset] = useState(false)

  function validate() {
    const e = {}
    if (!form.namaPaguyuban.trim()) e.namaPaguyuban = 'Wajib diisi.'
    if (!form.tahunAjaran.trim())   e.tahunAjaran = 'Wajib diisi.'
    if (!form.nominalIuran || isNaN(Number(form.nominalIuran)) || Number(form.nominalIuran) <= 0)
      e.nominalIuran = 'Masukkan nominal valid.'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const ev = validate()
    if (Object.keys(ev).length) { setErrors(ev); return }
    setLoading(true)
    setTimeout(() => {
      simpanSettings({
        namaPaguyuban: form.namaPaguyuban.trim(),
        tahunAjaran:   form.tahunAjaran.trim(),
        nominalIuran:  Number(form.nominalIuran),
        namaBank:      form.namaBank.trim(),
        noRekening:    form.noRekening.trim(),
        atasNama:      form.atasNama.trim(),
        kategoriPengeluaran: form.kategoriPengeluaran
          .split(',')
          .map(k => k.trim())
          .filter(Boolean),
      })
      addToast('Pengaturan berhasil disimpan!', 'success')
      setErrors({})
      setLoading(false)
    }, 300)
  }

  function handleResetData() {
    localStorage.removeItem('kp_settings')
    localStorage.removeItem('kp_siswa')
    localStorage.removeItem('kp_transaksi')
    localStorage.removeItem('kp_tagihan')
    addToast('Data direset. Halaman akan dimuat ulang…', 'info')
    setTimeout(() => window.location.reload(), 1200)
  }

  function field(key, label, placeholder = '', type = 'text', hint = '') {
    return (
      <div className="field">
        <label htmlFor={`set-${key}`}>{label}</label>
        <input
          id={`set-${key}`}
          className={`input${errors[key] ? ' input--error' : ''}`}
          type={type}
          placeholder={placeholder}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          disabled={loading}
        />
        {hint && <span className="hint">{hint}</span>}
        {errors[key] && <span className="error-msg">{errors[key]}</span>}
      </div>
    )
  }

  return (
    <div className="stack-lg">
      <div className="admin-top">
        <div>
          <h1 className="page-title">Pengaturan</h1>
          <p className="page-desc" style={{ marginBottom: 0 }}>Konfigurasi kelas, iuran, dan rekening.</p>
        </div>
      </div>

      {/* Warning jika tahun ajaran tidak sesuai tanggal sekarang */}
      {taWrong && (
        <div className="trust-note" style={{ background: 'var(--accent-light)', borderColor: 'var(--ink)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <strong>Tahun ajaran tidak sesuai!</strong><br />
            Bulan ini seharusnya TA <strong>{detectedTA}</strong>, bukan <strong>{settings.tahunAjaran}</strong>.
            Klik tombol di bawah atau ubah manual lalu simpan.
            <br />
            <button
              type="button"
              className="btn btn--primary btn--sm"
              style={{ marginTop: 10 }}
              onClick={() => {
                setForm(f => ({ ...f, tahunAjaran: detectedTA }))
                addToast(`Tahun ajaran diubah ke ${detectedTA}. Klik Simpan.`, 'info')
              }}
            >
              Ubah ke {detectedTA} otomatis
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="stack-lg" noValidate>
        {/* Info kelas */}
        <div className="card stack">
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Info Kelas</h2>
          {field('namaPaguyuban', 'Nama paguyuban / kelas *', 'SAID BIN HARITS — KBIT Mutiara Hati')}
          <div className="grid-2">
            <div className="field">
              <label htmlFor="set-tahunAjaran">Tahun ajaran aktif *</label>
              <input
                id="set-tahunAjaran"
                className={`input${errors.tahunAjaran ? ' input--error' : ''}`}
                type="text"
                placeholder={detectedTA}
                value={form.tahunAjaran}
                onChange={e => setForm(f => ({ ...f, tahunAjaran: e.target.value }))}
                disabled={loading}
              />
              <span className="hint">Terdeteksi otomatis: <strong>{detectedTA}</strong></span>
              {errors.tahunAjaran && <span className="error-msg">{errors.tahunAjaran}</span>}
            </div>
            {field('nominalIuran', 'Nominal iuran bulanan (Rp) *', '20000', 'number',
              'Berlaku untuk tagihan yang belum ada pembayaran.')}
          </div>
        </div>

        {/* Info rekening */}
        <div className="card stack">
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Info Rekening (tampil di publik)</h2>
          <div className="grid-2">
            {field('namaBank', 'Nama bank', 'BCA, Mandiri, dll.')}
            {field('noRekening', 'Nomor rekening', '1234567890')}
          </div>
          {field('atasNama', 'Atas nama', 'Nama pemilik rekening')}
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Kosongkan jika tidak ingin menampilkan info rekening di halaman publik.
          </p>
        </div>

        {/* Kategori pengeluaran */}
        <div className="card stack">
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Kategori Pengeluaran</h2>
          <div className="field">
            <label htmlFor="set-kategori">Daftar kategori</label>
            <input
              id="set-kategori"
              className="input"
              placeholder="ATK, Snack/Konsumsi, Dekorasi, ..."
              value={form.kategoriPengeluaran}
              onChange={e => setForm(f => ({ ...f, kategoriPengeluaran: e.target.value }))}
              disabled={loading}
            />
            <span className="hint">Pisahkan dengan koma.</span>
          </div>
        </div>

        {/* Akun admin */}
        <div className="card stack">
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Akun Admin</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Akun admin dikelola secara manual oleh pengembang di kode. Untuk reset password,
            hubungi pengembang atau update di file <code>AuthContext.jsx</code>.
          </p>
          <div className="list" style={{ boxShadow: 'none' }}>
            {[{ u: 'ketua', r: 'Ketua' }, { u: 'bendahara', r: 'Bendahara' }].map(acc => (
              <div key={acc.u} className="list-item" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <div className="list-item__main">
                  <p className="list-item__title">{acc.u}</p>
                  <p className="list-item__sub">Role: {acc.r}</p>
                </div>
                <span className="badge badge--info">Aktif</span>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
          {loading ? 'Menyimpan…' : 'Simpan pengaturan'}
        </button>
      </form>

      {/* Zona Berbahaya — Reset Data */}
      <div className="card stack" style={{ borderStyle: 'dashed' }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Zona Berbahaya</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Hapus semua data (wali murid, tagihan, transaksi, pengaturan) dan mulai ulang dari awal.
          Tindakan ini <strong>tidak dapat dibatalkan</strong>.
        </p>
        {!confirmReset ? (
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => setConfirmReset(true)}>
            Reset semua data…
          </button>
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 700 }}>
              Yakin ingin menghapus semua data? Ini tidak bisa dibatalkan!
            </p>
            <div className="row">
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setConfirmReset(false)}>Batal</button>
              <button type="button" className="btn btn--primary btn--sm" onClick={handleResetData}>Ya, reset sekarang</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
