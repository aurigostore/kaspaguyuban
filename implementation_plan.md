# Rencana Implementasi — Kas Paguyuban SAID BIN HARITS

## ✅ Bisa Deploy di Cloudflare + Domain `zaidbinharits.biz.id`

Ya, sepenuhnya bisa! Cloudflare menyediakan semua yang dibutuhkan — **gratis**.

---

## 🏗️ Arsitektur yang Diusulkan

```
┌─────────────────────────────────────────────┐
│         zaidbinharits.biz.id                │
├─────────────────┬───────────────────────────┤
│  Cloudflare     │  Cloudflare Workers       │
│  Pages          │  (API /api/*)             │
│  (Frontend)     │                           │
│  Vite + Vanilla │  ┌───────────────────┐    │
│  HTML/CSS/JS    │  │  Cloudflare D1    │    │
│                 │  │  (SQLite Database)│    │
│                 │  └───────────────────┘    │
└─────────────────┴───────────────────────────┘
```

### Stack Teknologi

| Layer | Teknologi | Alasan |
|---|---|---|
| **Frontend** | Vite + React | Sama seperti ruangmail, state management lebih rapi |
| **Backend API** | Cloudflare Workers | Serverless, gratis, sudah familiar (ruangmail) |
| **Database** | Cloudflare D1 (SQLite) | Gratis, ringan, cocok untuk data kecil |
| **Auth** | JWT + Cloudflare KV | Session token sederhana, aman |
| **Hosting** | Cloudflare Pages | Gratis unlimited, auto-deploy dari Git |
| **Domain** | `zaidbinharits.biz.id` | Custom domain gratis di Pages, **sudah di Cloudflare** ✅ |

---

## 💸 Biaya: GRATIS (Free Tier)

| Layanan | Free Tier | Kebutuhan kita |
|---|---|---|
| Cloudflare Pages | Unlimited requests | ✅ Cukup |
| Cloudflare Workers | 100.000 req/hari | ✅ Sangat cukup |
| Cloudflare D1 | 5 GB, 25M reads/bulan | ✅ Sangat cukup |
| Cloudflare KV | 100K reads/hari | ✅ Cukup untuk auth |
| Custom domain | Gratis | ✅ |

> Untuk paguyuban kelas (~30 orang), free tier lebih dari cukup.

---

## 🗄️ Skema Database (D1)

```sql
-- Wali murid (anggota paguyuban)
CREATE TABLE wali_murid (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,          -- "Ibu Ahmad Fauzi"
  nama_siswa TEXT,             -- nama anaknya (opsional)
  no_hp TEXT,
  catatan TEXT,
  aktif INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Iuran bulanan per wali murid
CREATE TABLE iuran (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wali_id INTEGER REFERENCES wali_murid(id),
  bulan TEXT NOT NULL,         -- "2026-07"
  nominal_tagihan INTEGER,     -- dari pengaturan
  nominal_dibayar INTEGER DEFAULT 0,
  status TEXT DEFAULT 'belum', -- 'lunas' | 'sebagian' | 'belum'
  metode TEXT,                 -- 'tunai' | 'transfer'
  catatan TEXT,
  tanggal_bayar TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Semua transaksi (pemasukan & pengeluaran)
CREATE TABLE transaksi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipe TEXT NOT NULL,          -- 'masuk' | 'keluar'
  kategori TEXT,               -- 'iuran' | 'sumbangan' | 'snack' | 'atk' | dll
  keterangan TEXT NOT NULL,
  nominal INTEGER NOT NULL,
  metode TEXT,
  tanggal TEXT NOT NULL,
  wali_id INTEGER,             -- jika iuran, link ke wali_murid
  iuran_id INTEGER,            -- jika iuran, link ke iuran
  created_at TEXT DEFAULT (datetime('now'))
);

-- Pengaturan (key-value)
CREATE TABLE pengaturan (
  key TEXT PRIMARY KEY,
  value TEXT
);
-- Contoh: iuran_bulanan=20000, tahun_ajaran=2025/2026, nama_kas=...

-- Admin users
CREATE TABLE admin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nama TEXT,
  role TEXT DEFAULT 'admin'   -- 'ketua' | 'bendahara' | 'admin'
);
```

---

## 📁 Struktur Project

```
D:\WEB\KAS PAGUYUBAN\
├── src/                     ← Frontend React + Vite
│   ├── main.jsx
│   ├── App.jsx              ← Router: publik / admin / login
│   ├── index.css            ← Tema neobrutalism (dari theme.css)
│   ├── api.js               ← Fetch helper ke Worker API
│   ├── pages/
│   │   ├── Publik.jsx       ← Dashboard publik
│   │   ├── StatusIuran.jsx  ← Status bayar wali murid
│   │   ├── Riwayat.jsx      ← Riwayat transaksi
│   │   ├── Login.jsx        ← Admin login
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── WaliMurid.jsx
│   │       ├── BayarIuran.jsx
│   │       ├── Pemasukan.jsx
│   │       ├── Pengeluaran.jsx
│   │       ├── Laporan.jsx
│   │       └── Pengaturan.jsx
│   └── components/
│       ├── BottomNav.jsx
│       ├── AdminDrawer.jsx
│       ├── Card.jsx
│       └── Badge.jsx
│
├── worker/                  ← Cloudflare Worker (API)
│   ├── src/
│   │   ├── index.js         ← Entry point + router
│   │   ├── routes/
│   │   │   ├── publik.js    ← GET saldo, status, riwayat
│   │   │   ├── admin.js     ← CRUD semua data (protected)
│   │   │   └── auth.js      ← Login / logout
│   │   └── db/
│   │       └── schema.sql   ← D1 schema
│   └── wrangler.toml
│
├── mockup/                  ← Referensi desain
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔐 Autentikasi

**Alur login admin:**
1. POST `/api/auth/login` → username + password
2. Worker cek ke tabel `admin` (bcrypt hash)
3. Jika cocok → generate JWT token (24 jam)
4. Token disimpan di `localStorage` browser
5. Semua request admin kirim `Authorization: Bearer <token>`
6. Worker verifikasi token setiap request

> Halaman publik **tidak perlu token** — data terbuka untuk semua.

---

## 🚀 API Endpoints

### Publik (no auth)
```
GET  /api/saldo              → saldo sekarang + total masuk/keluar
GET  /api/iuran/bulan/:bln   → status iuran bulan tertentu
GET  /api/transaksi          → riwayat transaksi (paginasi)
GET  /api/pengaturan/publik  → nominal iuran, nama kas, dll
```

### Admin (Bearer token required)
```
POST /api/auth/login
POST /api/auth/logout

GET/POST/PUT/DELETE /api/wali-murid
GET/POST/PUT        /api/iuran
GET/POST/PUT/DELETE /api/transaksi
GET/POST/PUT/DELETE /api/pengeluaran
GET                 /api/laporan/:bulan
GET                 /api/export/excel/:bulan
GET/PUT             /api/pengaturan
```

---

## 📋 Urutan Pengerjaan (Phase)

### Phase 1 — Fondasi (1-2 hari)
- [ ] Setup project Vite + struktur folder
- [ ] Setup Cloudflare Worker + D1 database
- [ ] Buat schema SQL + seed data awal
- [ ] Implementasi auth (login/logout/JWT)
- [ ] Deploy awal ke Cloudflare Pages

### Phase 2 — Halaman Publik (1 hari)
- [ ] Halaman publik: saldo, progress iuran
- [ ] Status iuran wali murid per bulan
- [ ] Riwayat transaksi (read-only)
- [ ] Koneksi ke API Worker

### Phase 3 — Admin Core (2-3 hari)
- [ ] Login admin
- [ ] Dashboard admin (ringkasan)
- [ ] CRUD Wali Murid
- [ ] Catat pembayaran iuran
- [ ] Catat pemasukan lain
- [ ] Catat pengeluaran

### Phase 4 — Fitur Lanjut (1-2 hari)
- [ ] Filter & rekap per bulan
- [ ] Export Excel (SheetJS)
- [ ] Export PDF (jsPDF)
- [ ] Pengaturan (nominal iuran, profil kas)

### Phase 5 — Deploy & Domain (30 menit)
- [ ] Push ke GitHub
- [ ] Connect ke Cloudflare Pages
- [ ] Sambungkan domain `zaidbinharits.biz.id`
- [ ] Set environment variables (JWT secret, dll)

---

## ⚠️ Hal yang Perlu Dikonfirmasi

> [!IMPORTANT]
> **Domain `zaidbinharits.biz.id`** — ✅ Sudah di Cloudflare, tinggal tambahkan sebagai custom domain di Cloudflare Pages nanti.

> [!IMPORTANT]
> **Akun Cloudflare** — ✅ Sudah ada, sama seperti yang dipakai ruangmail. Kita buat project baru di akun yang sama.

> [!NOTE]
> **Frontend**: React + Vite (sama seperti ruangmail). Style dari `theme.css` mockup akan di-port ke `index.css`.

> [!NOTE]
> **Export Excel/PDF** — Menggunakan library `SheetJS` (xlsx) dan `jsPDF` yang berjalan di browser, tidak butuh server.

---

## 🌐 Cara Deploy Domain

1. Beli/gunakan domain `zaidbinharits.biz.id` (registrar .biz.id: niagahoster, domainesia, dll)
2. Arahkan NS ke Cloudflare (tambahkan domain ke Cloudflare)
3. Di Cloudflare Pages: Settings → Custom Domain → tambah `zaidbinharits.biz.id`
4. Cloudflare otomatis urus SSL certificate (HTTPS gratis)

**Estimasi waktu**: 5-10 menit setelah DNS propagasi (~1-24 jam)

