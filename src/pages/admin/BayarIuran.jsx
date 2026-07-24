import { useState, useMemo, useCallback } from 'react'
import { useData, fmtRp, bulanOptions } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

// ── Helper: status badge ──────────────────────────────────────
function StatusBadge({ status }) {
  if (status === 'LUNAS')    return <span className="badge badge--lunas">Lunas</span>
  if (status === 'SEBAGIAN') return <span className="badge badge--sebagian">Sebagian</span>
  return <span className="badge badge--belum">Belum</span>
}

export default function BayarIuran() {
  const { settings, siswaList, tagihan, catatBayarIuran } = useData()
  const { user } = useAuth()
  const { addToast } = useToast()

  const now      = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const allBulan = bulanOptions(settings.tahunAjaran, settings.bulanMulai || 7)

  // ── State ─────────────────────────────────────────────────
  const [siswaId,  setSiswaId]  = useState('')
  const [metode,   setMetode]   = useState('Tunai')
  const [catatan,  setCatatan]  = useState('')
  const [tanggal,  setTanggal]  = useState(todayStr)
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})

  // checkedBulans: { [key: "bulan-tahun"]: nominal (string) }
  const [checkedBulans, setCheckedBulans] = useState({})

  const aktivSiswa = siswaList.filter(s => s.aktif)

  // ── Info tagihan per bulan untuk siswa yang dipilih ───────
  const bulanInfoList = useMemo(() => {
    if (!siswaId) return []
    return allBulan.map(({ bulan, tahun, label }) => {
      const t = tagihan.find(t => t.siswaId === siswaId && t.bulan === bulan && t.tahun === tahun)
      const nominal    = t ? t.nominal : settings.nominalIuran
      const totalBayar = t ? t.totalBayar : 0
      const sisa       = Math.max(0, nominal - totalBayar)
      const status     = t ? t.status : 'BELUM'
      return { bulan, tahun, label, nominal, totalBayar, sisa, status, key: `${bulan}-${tahun}` }
    })
  }, [siswaId, tagihan, allBulan, settings.nominalIuran])

  // ── Hitung total yang akan dibayar ────────────────────────
  const totalBayar = useMemo(() => {
    return Object.entries(checkedBulans).reduce((sum, [, nom]) => {
      const n = Number(nom)
      return sum + (isNaN(n) ? 0 : n)
    }, 0)
  }, [checkedBulans])

  const anyChecked = Object.keys(checkedBulans).length > 0

  // ── Toggle centang bulan ──────────────────────────────────
  const toggleBulan = useCallback((key, sisaTagihan) => {
    setCheckedBulans(prev => {
      if (prev[key] !== undefined) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: String(sisaTagihan || settings.nominalIuran) }
    })
  }, [settings.nominalIuran])

  // ── Ubah nominal per bulan ────────────────────────────────
  const setNominalBulan = useCallback((key, value) => {
    setCheckedBulans(prev => ({ ...prev, [key]: value }))
  }, [])

  // ── Pilih semua yang belum lunas ──────────────────────────
  function pilihBelumLunas() {
    const next = {}
    bulanInfoList.forEach(info => {
      if (info.status !== 'LUNAS' && info.sisa > 0) {
        next[info.key] = String(info.sisa)
      }
    })
    setCheckedBulans(next)
  }

  // ── Reset pilihan ─────────────────────────────────────────
  function resetPilihan() { setCheckedBulans({}) }

  // ── Ganti siswa → reset pilihan bulan ────────────────────
  function onSiswaChange(id) {
    setSiswaId(id)
    setCheckedBulans({})
    setErrors({})
  }

  // ── Validate ──────────────────────────────────────────────
  function validate() {
    const e = {}
    if (!siswaId)    e.siswaId = 'Pilih wali murid.'
    if (!anyChecked) e.bulan   = 'Pilih minimal satu bulan tagihan.'
    if (!tanggal)    e.tanggal = 'Tanggal wajib diisi.'

    // Cek nominal tiap bulan
    const nominalErrors = []
    Object.entries(checkedBulans).forEach(([key, nom]) => {
      const n = Number(nom)
      if (isNaN(n) || n <= 0) {
        nominalErrors.push(key)
      }
    })
    if (nominalErrors.length) e.nominal = `Nominal tidak valid di ${nominalErrors.length} bulan.`

    return e
  }

  // ── Submit ─────────────────────────────────────────────────
  function handleSubmit(ev) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setTimeout(() => {
      const entries = Object.entries(checkedBulans)
      entries.forEach(([key, nom]) => {
        const [bulan, tahun] = key.split('-').map(Number)
        catatBayarIuran({
          siswaId,
          bulan,
          tahun,
          nominal: Number(nom),
          metode,
          catatan,
          tanggal,
          createdBy: user?.username || 'admin',
        })
      })

      const namaSiswa = aktivSiswa.find(s => s.id === siswaId)?.nama || ''
      addToast(
        `${entries.length} pembayaran iuran ${namaSiswa} berhasil dicatat!`,
        'success'
      )

      // Reset form
      setSiswaId('')
      setCheckedBulans({})
      setCatatan('')
      setTanggal(todayStr)
      setErrors({})
      setLoading(false)
    }, 400)
  }

  return (
    <div className="stack-lg">
      <div className="admin-top">
        <div>
          <h1 className="page-title">Bayar Iuran</h1>
          <p className="page-desc" style={{ marginBottom: 0 }}>
            Catat pembayaran iuran — bisa sekaligus beberapa bulan.
          </p>
        </div>
      </div>

      <div className="card stack">
        <form onSubmit={handleSubmit} className="stack" noValidate>

          {/* ── Wali Murid ── */}
          <div className="field">
            <label htmlFor="wali-bayar">Wali Murid *</label>
            <select
              id="wali-bayar"
              className={`select${errors.siswaId ? ' input--error' : ''}`}
              value={siswaId}
              onChange={e => onSiswaChange(e.target.value)}
              disabled={loading}
            >
              <option value="">Pilih wali murid…</option>
              {aktivSiswa.map(s => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
            {errors.siswaId && <span className="error-msg">{errors.siswaId}</span>}
          </div>

          {/* ── Pilih Bulan (muncul setelah siswa dipilih) ── */}
          {siswaId && (
            <div className="field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <label style={{ margin: 0 }}>Bulan Tagihan *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={pilihBelumLunas} disabled={loading}>
                    Pilih belum lunas
                  </button>
                  {anyChecked && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={resetPilihan} disabled={loading}>
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Daftar bulan sebagai checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {bulanInfoList.map(info => {
                  const isChecked = checkedBulans[info.key] !== undefined
                  const isLunas   = info.status === 'LUNAS'

                  return (
                    <div
                      key={info.key}
                      style={{
                        padding: '10px 14px',
                        border: `2px solid ${isChecked ? 'var(--ink)' : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: 'var(--radius-md)',
                        background: isChecked
                          ? 'var(--accent-light)'
                          : isLunas
                          ? 'var(--surface-2)'
                          : 'var(--surface)',
                        opacity: isLunas ? 0.65 : 1,
                        cursor: isLunas ? 'not-allowed' : 'pointer',
                        transition: 'all 0.12s',
                        boxShadow: isChecked ? 'var(--shadow-brutal-sm)' : 'none',
                      }}
                      onClick={() => !isLunas && !loading && toggleBulan(info.key, info.sisa)}
                    >
                      {/* Baris 1: checkbox + label + badge + sisa */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {/* Checkbox visual */}
                        <div style={{
                          width: 20, height: 20,
                          border: '2px solid var(--ink)',
                          borderRadius: 4,
                          background: isChecked ? 'var(--accent)' : 'var(--surface)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: isChecked ? '1px 1px 0 var(--ink)' : 'none',
                          transition: 'all 0.1s',
                        }}>
                          {isChecked && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="2 6 5 9 10 3" />
                            </svg>
                          )}
                        </div>

                        {/* Label bulan */}
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', flex: 1, minWidth: 80 }}>
                          {info.label}
                        </span>

                        {/* Status badge */}
                        <StatusBadge status={info.status} />

                        {/* Info sisa */}
                        {!isLunas && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Sisa {fmtRp(info.sisa)}
                          </span>
                        )}
                      </div>

                      {/* Baris 2: nominal input — hanya saat dicentang, full width */}
                      {isChecked && (
                        <div
                          style={{ marginTop: 10, paddingTop: 10, borderTop: '1.5px solid rgba(0,0,0,0.12)' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="field" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.68rem', marginBottom: 4 }}>
                              Nominal bayar (Rp)
                            </label>
                            <input
                              type="number"
                              min="1"
                              className="input"
                              style={{ minHeight: 40 }}
                              value={checkedBulans[info.key]}
                              onChange={e => setNominalBulan(info.key, e.target.value)}
                              disabled={loading}
                              placeholder={String(info.sisa || settings.nominalIuran)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {errors.bulan   && <span className="error-msg" style={{ marginTop: 4 }}>{errors.bulan}</span>}
              {errors.nominal && <span className="error-msg" style={{ marginTop: 4 }}>{errors.nominal}</span>}

              {/* Total */}
              {anyChecked && (
                <div style={{
                  marginTop: 10,
                  padding: '12px 16px',
                  background: 'var(--accent)',
                  border: '2px solid var(--ink)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-brutal-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                    Total ({Object.keys(checkedBulans).length} bulan)
                  </span>
                  <strong style={{ fontSize: '1rem', letterSpacing: '-0.02em' }}>
                    {fmtRp(totalBayar)}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* ── Tanggal ── */}
          <div className="grid-2">
            <div className="field">
              <label htmlFor="tgl-bayar">Tanggal bayar *</label>
              <input
                id="tgl-bayar"
                className={`input${errors.tanggal ? ' input--error' : ''}`}
                type="date"
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
                disabled={loading}
              />
              {errors.tanggal && <span className="error-msg">{errors.tanggal}</span>}
            </div>

            {/* ── Metode ── */}
            <div className="field">
              <label>Metode</label>
              <div className="chips" id="metode-chips">
                {['Tunai', 'Transfer'].map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`chip${metode === m ? ' is-active' : ''}`}
                    onClick={() => setMetode(m)}
                    disabled={loading}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Catatan ── */}
          <div className="field">
            <label htmlFor="catatan-bayar">Catatan (opsional)</label>
            <input
              id="catatan-bayar"
              className="input"
              placeholder="mis. pelunasan 3 bulan sekaligus"
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={loading || aktivSiswa.length === 0 || !anyChecked}
          >
            {loading
              ? 'Menyimpan…'
              : anyChecked
              ? `Catat ${Object.keys(checkedBulans).length} pembayaran (${fmtRp(totalBayar)})`
              : 'Catat pembayaran'}
          </button>

          {aktivSiswa.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--accent-text)', textAlign: 'center', fontWeight: 700 }}>
              Tambahkan data wali murid terlebih dahulu di menu "Wali Murid".
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
