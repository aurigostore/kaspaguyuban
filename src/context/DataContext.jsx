/**
 * DataContext — menyimpan semua state aplikasi in-memory (localStorage).
 * Berfungsi sebagai "backend lokal" sampai ada REST API sungguhan.
 *
 * FIX v2:
 * - Auto-detect tahun ajaran aktif berdasarkan tanggal hari ini
 * - Migrasi otomatis jika localStorage tahunAjaran tidak mencakup bulan sekarang
 * - Regenerasi tagihan untuk semua siswa ketika tahun ajaran diperbarui
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const DataContext = createContext(null)

// ── Helper ──────────────────────────────────────────────────────
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (_) {}
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// ── Auto-detect tahun ajaran berdasarkan tanggal sekarang ──────
// Juli 2026 → "2026/2027", Januari 2026 → "2025/2026"
export function detectTahunAjaran(bulanMulai = 7) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()
  if (month >= bulanMulai) {
    return `${year}/${year + 1}`
  }
  return `${year - 1}/${year}`
}

// ── Cek apakah suatu bulan/tahun tercakup dalam tahunAjaran ────
export function isBulanDalamTahunAjaran(bulan, tahun, tahunAjaran, bulanMulai = 7) {
  const months = bulanOptions(tahunAjaran, bulanMulai)
  return months.some(m => m.bulan === bulan && m.tahun === tahun)
}

// ── Default settings ──────────────────────────────────────────
function makeDefaultSettings() {
  return {
    namaPaguyuban: 'SAID BIN HARITS — KBIT Mutiara Hati',
    tahunAjaran: detectTahunAjaran(7),   // auto-detect
    nominalIuran: 20000,
    bulanMulai: 7, // Juli
    namaBank: 'BCA',
    noRekening: '',
    atasNama: '',
    kategoriPengeluaran: ['ATK', 'Snack/Konsumsi', 'Dekorasi', 'Transport', 'Hadiah', 'Lain-lain'],
  }
}

// ── Status tagihan helper ─────────────────────────────────────
export function hitungStatus(nominal, totalBayar) {
  if (totalBayar <= 0) return 'BELUM'
  if (totalBayar >= nominal) return 'LUNAS'
  return 'SEBAGIAN'
}

// ── Bulan label ───────────────────────────────────────────────
const BULAN_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export function bulanLabel(bulan, tahun) {
  return `${BULAN_NAMES[bulan]} ${tahun}`
}

export function bulanOptions(tahunAjaran, bulanMulai = 7) {
  const parts  = tahunAjaran.split('/')
  const tahun1 = parseInt(parts[0]) || 2026
  const tahun2 = parseInt(parts[1]) || 2027

  const months = []
  for (let m = bulanMulai; m <= 12; m++) {
    months.push({ bulan: m, tahun: tahun1, label: bulanLabel(m, tahun1) })
  }
  for (let m = 1; m < bulanMulai; m++) {
    months.push({ bulan: m, tahun: tahun2, label: bulanLabel(m, tahun2) })
  }
  return months
}

// ── Format uang ──────────────────────────────────────────────
export function fmtRp(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID')
}

// ── Format tanggal ────────────────────────────────────────────
export function fmtTanggal(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Internal: generate tagihan untuk siswa ───────────────────
function _generateTagihanSiswa(siswa, settings, setTagihan) {
  const months = bulanOptions(settings.tahunAjaran, settings.bulanMulai || 7)
  setTagihan(prev => {
    const newItems = []
    months.forEach(({ bulan, tahun }) => {
      const exists = prev.find(t => t.siswaId === siswa.id && t.bulan === bulan && t.tahun === tahun)
      if (!exists) {
        newItems.push({
          id: uid(),
          siswaId: siswa.id,
          bulan,
          tahun,
          tahunAjaran: settings.tahunAjaran,
          nominal: settings.nominalIuran,
          totalBayar: 0,
          status: 'BELUM',
          createdAt: new Date().toISOString(),
        })
      }
    })
    return [...prev, ...newItems]
  })
}

// ── Provider ──────────────────────────────────────────────────
export function DataProvider({ children }) {
  const DEFAULT_SETTINGS = makeDefaultSettings()

  const [settings, setSettings]   = useState(() => {
    const stored = load('kp_settings', null)
    if (!stored) return DEFAULT_SETTINGS

    // ── MIGRASI: cek apakah tahunAjaran tersimpan sudah benar ──
    const correct = detectTahunAjaran(stored.bulanMulai || 7)
    if (stored.tahunAjaran !== correct) {
      // Update tahunAjaran ke yang benar, simpan ke localStorage
      const fixed = { ...stored, tahunAjaran: correct }
      save('kp_settings', fixed)
      return fixed
    }
    return stored
  })

  const [siswaList, setSiswaList] = useState(() => load('kp_siswa', []))
  const [transaksi, setTransaksi] = useState(() => load('kp_transaksi', []))
  const [tagihan, setTagihan]     = useState(() => {
    // Muat tagihan, lalu bersihkan entri dari tahun ajaran yang sudah tidak aktif
    return load('kp_tagihan', [])
  })

  // ── Migrasi tagihan setelah settings selesai dimuat ──────────
  useEffect(() => {
    if (siswaList.length === 0) return
    const correct = detectTahunAjaran(settings.bulanMulai || 7)
    if (settings.tahunAjaran !== correct) return // sudah ditangani di useState

    // Cek apakah ada siswa yang belum punya tagihan untuk tahun ajaran aktif
    const now = new Date()
    const bulanSekarang = now.getMonth() + 1
    const tahunSekarang = now.getFullYear()

    const aktivSiswa = siswaList.filter(s => s.aktif)
    const tagihanBulanIni = tagihan.filter(
      t => t.bulan === bulanSekarang && t.tahun === tahunSekarang
    )

    // Jika ada siswa aktif tapi tidak ada tagihan bulan ini → regenerate
    const siswaYangBelumAdaTagihan = aktivSiswa.filter(
      s => !tagihanBulanIni.some(t => t.siswaId === s.id)
    )

    if (siswaYangBelumAdaTagihan.length > 0) {
      // Buat tagihan untuk bulan yang belum ada
      const months = bulanOptions(settings.tahunAjaran, settings.bulanMulai || 7)
      setTagihan(prev => {
        const newItems = []
        siswaYangBelumAdaTagihan.forEach(siswa => {
          months.forEach(({ bulan, tahun }) => {
            const exists = prev.find(
              t => t.siswaId === siswa.id && t.bulan === bulan && t.tahun === tahun
            )
            if (!exists) {
              newItems.push({
                id: uid(),
                siswaId: siswa.id,
                bulan,
                tahun,
                tahunAjaran: settings.tahunAjaran,
                nominal: settings.nominalIuran,
                totalBayar: 0,
                status: 'BELUM',
                createdAt: new Date().toISOString(),
              })
            }
          })
        })
        if (newItems.length === 0) return prev
        console.log(`[DataContext] Migrasi: +${newItems.length} tagihan baru untuk ${siswaYangBelumAdaTagihan.length} siswa`)
        return [...prev, ...newItems]
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // hanya saat mount

  // Persist on change
  useEffect(() => { save('kp_settings', settings) }, [settings])
  useEffect(() => { save('kp_siswa', siswaList)   }, [siswaList])
  useEffect(() => { save('kp_transaksi', transaksi) }, [transaksi])
  useEffect(() => { save('kp_tagihan', tagihan)   }, [tagihan])

  // ── Siswa CRUD ─────────────────────────────────────────────
  const tambahSiswa = useCallback((data) => {
    const siswa = { id: uid(), ...data, aktif: true, createdAt: new Date().toISOString() }
    setSiswaList(prev => [...prev, siswa])
    _generateTagihanSiswa(siswa, settings, setTagihan)
    return siswa
  }, [settings])

  const editSiswa = useCallback((id, data) => {
    setSiswaList(prev => prev.map(s => s.id === id ? { ...s, ...data } : s))
  }, [])

  const toggleAktifSiswa = useCallback((id) => {
    setSiswaList(prev => prev.map(s => s.id === id ? { ...s, aktif: !s.aktif } : s))
  }, [])

  // ── Tagihan ────────────────────────────────────────────────
  const getTagihan = useCallback((siswaId, bulan, tahun) => {
    return tagihan.find(t => t.siswaId === siswaId && t.bulan === bulan && t.tahun === tahun)
  }, [tagihan])

  const getTagihanSiswa = useCallback((siswaId) => {
    return tagihan.filter(t => t.siswaId === siswaId)
  }, [tagihan])

  const ensureTagihan = useCallback((siswaId, bulan, tahun) => {
    const existing = tagihan.find(t => t.siswaId === siswaId && t.bulan === bulan && t.tahun === tahun)
    if (existing) return existing
    const t = {
      id: uid(),
      siswaId,
      bulan,
      tahun,
      tahunAjaran: settings.tahunAjaran,
      nominal: settings.nominalIuran,
      totalBayar: 0,
      status: 'BELUM',
      createdAt: new Date().toISOString(),
    }
    setTagihan(prev => [...prev, t])
    return t
  }, [tagihan, settings])

  // ── Transaksi: Catat Bayar Iuran ──────────────────────────
  const catatBayarIuran = useCallback(({ siswaId, bulan, tahun, nominal, metode, catatan, tanggal, createdBy }) => {
    const existing = tagihan.find(t => t.siswaId === siswaId && t.bulan === bulan && t.tahun === tahun)
    let tagihanId
    const currentTotal = existing ? existing.totalBayar : 0
    const newTotal = currentTotal + nominal

    if (existing) {
      tagihanId = existing.id
      // Update tagihan yang sudah ada
      setTagihan(prev => prev.map(t => {
        if (t.id === tagihanId) {
          return {
            ...t,
            totalBayar: newTotal,
            status: hitungStatus(t.nominal, newTotal),
          }
        }
        return t
      }))
    } else {
      // Buat tagihan baru sekaligus dengan totalBayar sudah terisi (atomic)
      const t = {
        id: uid(),
        siswaId,
        bulan,
        tahun,
        tahunAjaran: settings.tahunAjaran,
        nominal: settings.nominalIuran,
        totalBayar: newTotal,
        status: hitungStatus(settings.nominalIuran, newTotal),
        createdAt: new Date().toISOString(),
      }
      tagihanId = t.id
      setTagihan(prev => [...prev, t])
    }

    // Simpan transaksi
    const trx = {
      id: uid(),
      tipe: 'iuran',
      siswaId,
      tagihanId,
      bulan,
      tahun,
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      nominal,
      metode,
      catatan: catatan || '',
      createdBy: createdBy || 'admin',
      createdAt: new Date().toISOString(),
    }
    setTransaksi(prev => [...prev, trx])
    return trx
  }, [tagihan, settings])

  // ── Transaksi: Pemasukan Lain ──────────────────────────────
  const catatPemasukan = useCallback(({ tanggal, nominal, keterangan, metode, createdBy }) => {
    const trx = {
      id: uid(),
      tipe: 'pemasukan_lain',
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      nominal,
      keterangan,
      metode: metode || '',
      createdBy: createdBy || 'admin',
      createdAt: new Date().toISOString(),
    }
    setTransaksi(prev => [...prev, trx])
    return trx
  }, [])

  // ── Transaksi: Pengeluaran ─────────────────────────────────
  const catatPengeluaran = useCallback(({ tanggal, nominal, kategori, keterangan, createdBy }) => {
    const trx = {
      id: uid(),
      tipe: 'pengeluaran',
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      nominal,
      kategori,
      keterangan,
      createdBy: createdBy || 'admin',
      createdAt: new Date().toISOString(),
    }
    setTransaksi(prev => [...prev, trx])
    return trx
  }, [])

  // ── Hapus transaksi ────────────────────────────────────────
  const hapusTransaksi = useCallback((id) => {
    const trx = transaksi.find(t => t.id === id)
    if (!trx) return

    if (trx.tipe === 'iuran' && trx.tagihanId) {
      setTagihan(prev => prev.map(t => {
        if (t.id === trx.tagihanId) {
          const newTotal = Math.max(0, t.totalBayar - trx.nominal)
          return { ...t, totalBayar: newTotal, status: hitungStatus(t.nominal, newTotal) }
        }
        return t
      }))
    }

    setTransaksi(prev => prev.filter(t => t.id !== id))
  }, [transaksi])

  // ── Simpan settings (dengan auto-regenerate tagihan jika tahunAjaran berubah) ──
  const simpanSettings = useCallback((data) => {
    setSettings(prev => {
      const next = { ...prev, ...data }

      // Jika tahunAjaran berubah → regenerate tagihan untuk semua siswa aktif
      if (data.tahunAjaran && data.tahunAjaran !== prev.tahunAjaran) {
        setSiswaList(currentSiswa => {
          const aktivSiswa = currentSiswa.filter(s => s.aktif)
          if (aktivSiswa.length > 0) {
            const months = bulanOptions(next.tahunAjaran, next.bulanMulai || 7)
            setTagihan(prevTagihan => {
              const newItems = []
              aktivSiswa.forEach(siswa => {
                months.forEach(({ bulan, tahun }) => {
                  const exists = prevTagihan.find(
                    t => t.siswaId === siswa.id && t.bulan === bulan && t.tahun === tahun
                  )
                  if (!exists) {
                    newItems.push({
                      id: uid(),
                      siswaId: siswa.id,
                      bulan,
                      tahun,
                      tahunAjaran: next.tahunAjaran,
                      nominal: next.nominalIuran || prev.nominalIuran,
                      totalBayar: 0,
                      status: 'BELUM',
                      createdAt: new Date().toISOString(),
                    })
                  }
                })
              })
              return newItems.length > 0 ? [...prevTagihan, ...newItems] : prevTagihan
            })
          }
          return currentSiswa
        })
      }

      return next
    })
  }, [])

  // ── Kalkulasi dashboard ────────────────────────────────────
  const getDashboard = useCallback((filterBulan = null, filterTahun = null) => {
    const allIncome = transaksi
      .filter(t => t.tipe !== 'pengeluaran')
      .reduce((s, t) => s + t.nominal, 0)

    const allExpense = transaksi
      .filter(t => t.tipe === 'pengeluaran')
      .reduce((s, t) => s + t.nominal, 0)

    const saldo = allIncome - allExpense

    const now = new Date()
    const bln = filterBulan || (now.getMonth() + 1)
    const thn = filterTahun || now.getFullYear()

    const masukBulanIni = transaksi
      .filter(t => {
        const d = new Date(t.tanggal)
        return t.tipe !== 'pengeluaran' && d.getMonth() + 1 === bln && d.getFullYear() === thn
      })
      .reduce((s, t) => s + t.nominal, 0)

    const keluarBulanIni = transaksi
      .filter(t => {
        const d = new Date(t.tanggal)
        return t.tipe === 'pengeluaran' && d.getMonth() + 1 === bln && d.getFullYear() === thn
      })
      .reduce((s, t) => s + t.nominal, 0)

    // Filter tagihan bulan ini — hanya siswa aktif
    const aktivIds = siswaList.filter(s => s.aktif).map(s => s.id)
    const tagihanBulanIni = tagihan.filter(
      t => t.bulan === bln && t.tahun === thn && aktivIds.includes(t.siswaId)
    )
    const lunas    = tagihanBulanIni.filter(t => t.status === 'LUNAS').length
    const sebagian = tagihanBulanIni.filter(t => t.status === 'SEBAGIAN').length
    const belum    = tagihanBulanIni.filter(t => t.status === 'BELUM').length
    const total    = tagihanBulanIni.length

    return { saldo, allIncome, allExpense, masukBulanIni, keluarBulanIni, lunas, sebagian, belum, total }
  }, [transaksi, tagihan, siswaList])

  const value = {
    settings,
    siswaList,
    transaksi,
    tagihan,
    // actions
    tambahSiswa,
    editSiswa,
    toggleAktifSiswa,
    catatBayarIuran,
    catatPemasukan,
    catatPengeluaran,
    hapusTransaksi,
    simpanSettings,
    ensureTagihan,
    getTagihan,
    getTagihanSiswa,
    // helpers
    getDashboard,
    bulanOptions: () => bulanOptions(settings.tahunAjaran, settings.bulanMulai || 7),
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}
