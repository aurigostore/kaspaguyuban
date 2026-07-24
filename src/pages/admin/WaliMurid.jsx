import { useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const INIT = { nama: '', namaWali: '', catatan: '', aktif: true }

export default function WaliMurid() {
  const { siswaList, tambahSiswa, editSiswa, toggleAktifSiswa } = useData()
  const { addToast } = useToast()

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(INIT)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showNonaktif, setShowNonaktif] = useState(false)

  const filtered = siswaList.filter(s => {
    const q = search.toLowerCase()
    const match = !q || s.nama.toLowerCase().includes(q) || (s.namaWali || '').toLowerCase().includes(q)
    const aktifFilter = showNonaktif ? true : s.aktif
    return match && aktifFilter
  })

  function openAdd() {
    setForm(INIT)
    setEditId(null)
    setErrors({})
    setShowForm(true)
  }

  function openEdit(s) {
    setForm({ nama: s.nama, namaWali: s.namaWali || '', catatan: s.catatan || '', aktif: s.aktif })
    setEditId(s.id)
    setErrors({})
    setShowForm(true)
  }

  function validate() {
    const e = {}
    if (!form.nama.trim()) e.nama = 'Nama wali murid wajib diisi.'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    setTimeout(() => {
      if (editId) {
        editSiswa(editId, { nama: form.nama.trim(), namaWali: form.namaWali.trim(), catatan: form.catatan.trim() })
        addToast('Data wali murid berhasil diperbarui.', 'success')
      } else {
        tambahSiswa({ nama: form.nama.trim(), namaWali: form.namaWali.trim(), catatan: form.catatan.trim() })
        addToast('Wali murid berhasil ditambahkan.', 'success')
      }
      setLoading(false)
      setShowForm(false)
    }, 300)
  }

  function handleToggle(s) {
    toggleAktifSiswa(s.id)
    addToast(s.aktif ? 'Siswa dinonaktifkan.' : 'Siswa diaktifkan kembali.', 'info')
  }

  const aktifCount = siswaList.filter(s => s.aktif).length

  return (
    <div className="stack-lg">
      <div className="admin-top">
        <div>
          <h1 className="page-title">Data Wali Murid</h1>
          <p className="page-desc" style={{ marginBottom: 0 }}>
            {aktifCount} wali murid aktif · Kelola daftar paguyuban SAID BIN HARITS.
          </p>
        </div>
        <button type="button" className="btn btn--primary btn--sm" onClick={openAdd}>
          + Tambah wali murid
        </button>
      </div>

      {/* Search & filter */}
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <div className="field" style={{ flex: 1, minWidth: 180 }}>
          <input
            className="input input--search"
            type="search"
            placeholder="Cari nama wali murid…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={showNonaktif} onChange={e => setShowNonaktif(e.target.checked)} />
          Tampilkan nonaktif
        </label>
      </div>

      {/* Form tambah/edit */}
      {showForm && (
        <div className="card stack" style={{ borderColor: 'var(--accent)', boxShadow: 'var(--shadow-brutal), 0 0 0 3px var(--accent-glow)' }}>
          <h2 style={{ margin: 0, fontSize: 15 }}>{editId ? 'Edit Wali Murid' : 'Tambah Wali Murid'}</h2>
          <form onSubmit={handleSubmit} className="stack" noValidate>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="form-nama">Nama lengkap wali murid *</label>
                <input
                  id="form-nama"
                  className={`input${errors.nama ? ' input--error' : ''}`}
                  placeholder="Nama wali murid"
                  value={form.nama}
                  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                  disabled={loading}
                />
                {errors.nama && <span className="error-msg">{errors.nama}</span>}
              </div>
              <div className="field">
                <label htmlFor="form-wali">Nama siswa (opsional)</label>
                <input
                  id="form-wali"
                  className="input"
                  placeholder="Nama anak / siswa"
                  value={form.namaWali}
                  onChange={e => setForm(f => ({ ...f, namaWali: e.target.value }))}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="form-catatan">Catatan internal</label>
              <textarea
                id="form-catatan"
                className="textarea"
                placeholder="Catatan untuk admin (tidak tampil di publik)"
                value={form.catatan}
                onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn--secondary" onClick={() => setShowForm(false)} disabled={loading}>
                Batal
              </button>
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? 'Menyimpan…' : editId ? 'Simpan perubahan' : 'Simpan wali murid'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.4 }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <p>{search ? 'Tidak ada hasil pencarian.' : 'Belum ada wali murid. Klik "+ Tambah wali murid" untuk memulai.'}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Nama wali murid</th>
                <th>Nama siswa</th>
                <th>Status</th>
                <th>Catatan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} style={{ opacity: s.aktif ? 1 : 0.5 }}>
                  <td style={{ fontWeight: 700 }}>{s.nama}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.namaWali || '—'}</td>
                  <td>
                    <span className={`badge ${s.aktif ? 'badge--aktif' : 'badge--nonaktif'}`}>
                      {s.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 180 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {s.catatan || '—'}
                    </span>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <button className="btn btn--ghost btn--sm" type="button" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn--ghost btn--sm" type="button" onClick={() => handleToggle(s)}
                        style={{ fontWeight: 700 }}>
                        {s.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
