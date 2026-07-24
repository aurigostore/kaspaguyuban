# PRD — Aplikasi Kas Paguyuban Kelas

| Field | Value |
|---|---|
| **Nama produk** | Kas Paguyuban — SAID BIN HARITS |
| **Sekolah** | KBIT Mutiara Hati |
| **Kelas** | SAID BIN HARITS |
| **Dokumen** | Product Requirements Document (PRD) |
| **Versi** | 1.0 |
| **Tanggal** | 20 Juli 2026 |
| **Pemilik produk** | Ketua Paguyuban Kelas SAID BIN HARITS |
| **Status** | Draft untuk implementasi |

---

## 1. Ringkasan Eksekutif

Aplikasi web kas kelas untuk paguyuban KBIT Mutiara Hati — kelas SAID BIN HARITS. Tujuannya agar ketua & bendahara bisa mencatat uang masuk/keluar dengan rapi, dan semua wali murid bisa melihat transparansi kas (saldo, rekap, status bayar) tanpa ribet login.

**Masalah yang diselesaikan**
- Pencatatan kas masih manual / tersebar di chat WA → sulit dilacak
- Wali murid sering tanya “sudah bayar belum?” / “sisa kas berapa?”
- Belum ada daftar jelas siapa yang lunas / belum tiap bulan
- Laporan rapat harus disusun ulang setiap kali

**Hasil yang diharapkan**
- Satu sumber data kas yang transparan
- Bendahara input cepat (tunai / transfer)
- Wali murid buka link → langsung lihat status & laporan
- Export laporan siap pakai (Excel / PDF)

---

## 2. Tujuan & Metrik Sukses

### 2.1 Tujuan
1. Mencatat **pemasukan** (iuran bulanan + pemasukan lain) dan **pengeluaran** secara terstruktur.
2. Memberi **transparansi** ke seluruh wali murid (read-only, tanpa login).
3. Memudahkan **bendahara & ketua** mengelola data siswa, iuran, dan laporan (full access).
4. Menyediakan **rekap bulanan** dan **export** untuk arsip / rapat.

### 2.2 Metrik sukses (MVP)
| Metrik | Target |
|---|---|
| Waktu input 1 pembayaran | ≤ 30 detik |
| Wali murid bisa cek status bayar tanpa bantuan admin | Ya |
| Saldo kas selalu cocok dengan total transaksi | 100% konsisten |
| Laporan bulanan bisa di-export | Excel + PDF |
| Bisa dipakai di HP (browser) | Responsive |

---

## 3. Pengguna & Peran

| Peran | Cara akses | Hak akses |
|---|---|---|
| **Publik / Wali murid** | Buka link web, **tanpa login** | Lihat dashboard, rekap, daftar lunas/belum, detail transaksi (read-only) |
| **Admin** (Ketua & Bendahara) | Login (username + password) | Semua fitur publik + kelola siswa, iuran, transaksi, pengaturan, export |

> Catatan keamanan: data publik bersifat ringkas & operasional kelas (nama siswa, status bayar, nominal). Tidak menampilkan nomor HP, alamat, atau data sensitif lain. Admin login wajib untuk perubahan data.

---

## 4. Ruang Lingkup

### 4.1 In Scope (MVP)
- Dashboard saldo kas (total masuk, total keluar, sisa)
- Master data siswa / wali (CRUD oleh admin)
- Iuran rutin bulanan (default Rp 20.000, **bisa diubah di pengaturan**)
- Status bayar per siswa per bulan (lunas / belum / sebagian)
- Pemasukan lain (tidak terduga): sumbangan, sisa kegiatan, dll.
- Pengeluaran dengan kategori & keterangan
- Metode bayar: **Transfer / e-wallet** dan **Tunai**
- Upload / catat bukti transfer (opsional, foto/file)
- Filter & rekap per bulan
- Export Excel & PDF
- Satu tahun ajaran aktif (konfigurasi di pengaturan)
- Web responsive (HP & laptop)

### 4.2 Out of Scope (belum di MVP)
- Login per wali murid
- Notifikasi WhatsApp otomatis
- Integrasi payment gateway / QRIS otomatis
- Multi-kelas / multi-sekolah
- Multi tahun ajaran paralel (bisa ditambah di v2)
- Aplikasi native Android/iOS
- Role guru terpisah (guru cukup pakai akses publik, atau dibantu admin)

---

## 5. Konsep Bisnis

### 5.1 Tahun ajaran
- MVP memakai **satu tahun ajaran aktif** (contoh: `2025/2026`).
- Diset di **Pengaturan**.
- Semua transaksi & iuran mengacu ke tahun ajaran aktif.

### 5.2 Iuran bulanan
- Default: **Rp 20.000 / siswa / bulan**.
- Nominal **bisa diubah** di Pengaturan (berlaku ke bulan-bulan yang belum ditagih / sesuai aturan di bawah).
- Setiap siswa otomatis punya **tagihan per bulan** (Juli–Juni atau sesuai kalender yang diset).
- Status per tagihan:
  - `BELUM` — belum ada pembayaran
  - `SEBAGIAN` — bayar kurang dari nominal
  - `LUNAS` — total bayar ≥ nominal
- Boleh bayar lebih dari 1 bulan sekaligus (mis. bayar 3 bulan di muka) → admin catat ke beberapa tagihan.

### 5.3 Pemasukan lain
- Bukan iuran rutin (contoh: sumbangan, sisa study tour, pengembalian kas).
- Wajib: tanggal, nominal, keterangan, metode (opsional), dicatat oleh.
- Mempengaruhi saldo kas.

### 5.4 Pengeluaran
- Wajib: tanggal, nominal, kategori, keterangan, bukti (opsional).
- Kategori contoh: ATK, Snack/Konsumsi, Dekorasi, Transport, Hadiah, Lain-lain.
- Mempengaruhi saldo kas.

### 5.5 Saldo kas
```
Saldo = Total Pemasukan (iuran + pemasukan lain) − Total Pengeluaran
```
Saldo dihitung real-time dari transaksi yang tersimpan (bukan angka manual).

### 5.6 Metode pembayaran
| Metode | Alur |
|---|---|
| **Tunai** | Wali bayar ke bendahara → admin catat langsung sebagai lunas/sebagian |
| **Transfer / e-wallet** | Wali transfer → (opsional) kirim bukti → admin verifikasi & catat |

Tidak ada auto-verifikasi transfer di MVP; admin yang mengunci status.

---

## 6. User Stories

### 6.1 Publik / Wali murid (tanpa login)
1. Sebagai wali, saya ingin membuka link kas kelas di HP agar saya bisa cek saldo terkini.
2. Sebagai wali, saya ingin melihat daftar siswa yang sudah / belum bayar bulan ini agar transparan.
3. Sebagai wali, saya ingin melihat rekap pemasukan & pengeluaran per bulan agar tahu uang dipakai untuk apa.
4. Sebagai wali, saya ingin mencari nama anak saya di daftar status bayar agar cepat tahu statusnya.

### 6.2 Admin (Ketua / Bendahara)
1. Sebagai bendahara, saya ingin login agar hanya saya & ketua yang bisa mengubah data.
2. Sebagai bendahara, saya ingin menambah/mengedit data siswa.
3. Sebagai bendahara, saya ingin mencatat pembayaran iuran (tunai/transfer) dalam hitungan detik.
4. Sebagai bendahara, saya ingin mengubah nominal iuran bulanan di pengaturan bila kondisi berubah.
5. Sebagai bendahara, saya ingin mencatat pemasukan tak terduga.
6. Sebagai bendahara, saya ingin mencatat pengeluaran beserta kategori & keterangan.
7. Sebagai ketua, saya ingin export laporan Excel/PDF untuk rapat paguyuban.
8. Sebagai admin, saya ingin melihat dashboard ringkas (saldo, lunas bulan ini, belanja bulan ini).

---

## 7. Fitur Detail (MVP)

### 7.1 Halaman Publik (tanpa login)

#### A. Dashboard
- Saldo kas saat ini (besar & jelas)
- Total pemasukan bulan berjalan
- Total pengeluaran bulan berjalan
- Ringkas: X dari Y siswa sudah lunas bulan ini
- Tahun ajaran aktif

#### B. Status Iuran
- Filter bulan (default: bulan berjalan)
- Tabel/list: Nama siswa | Status | Nominal tagihan | Sudah dibayar
- Badge warna: Lunas (hijau), Sebagian (kuning), Belum (merah/abu)
- Search nama siswa
- Progress bar: % lunas bulan terpilih

#### C. Riwayat Transaksi / Laporan
- Tab atau filter: Semua / Pemasukan / Pengeluaran
- Filter bulan
- List: tanggal, jenis, keterangan, nominal (+/−), metode
- Ringkas total masuk & keluar di periode terpilih

> Privasi: di halaman publik, cukup tampilkan nama siswa + status. Tidak perlu nomor HP / kontak.

---

### 7.2 Area Admin (wajib login)

#### A. Autentikasi
- Login: username + password
- Logout
- (Opsional v1.1) ganti password
- Session aman (cookie/JWT); timeout wajar
- Minimal 1–2 akun admin (ketua & bendahara) di seed/pengaturan

#### B. Dashboard Admin
- Semua info dashboard publik
- Shortcut cepat: + Bayar iuran, + Pengeluaran, + Pemasukan lain
- Peringatan: daftar siswa belum bayar bulan ini (top list)

#### C. Data Siswa
- CRUD siswa: nama lengkap, nama panggilan (opsional), nama wali (opsional), catatan (opsional), status aktif
- Soft-delete / nonaktifkan siswa pindah (riwayat bayar tetap ada)
- Import manual satu per satu dulu (import Excel = nice to have)

#### D. Pembayaran Iuran
- Pilih siswa + bulan tagihan (+ multi-bulan jika bayar sekaligus)
- Input nominal bayar (default = sisa tagihan)
- Metode: Tunai / Transfer
- Tanggal bayar
- Catatan + upload bukti (opsional)
- Otomatis update status tagihan (BELUM / SEBAGIAN / LUNAS)
- Bisa batalkan / edit transaksi (dengan jejak audit sederhana bila memungkinkan)

#### E. Pemasukan Lain
- Form: tanggal, nominal, keterangan, metode (opsional), bukti (opsional)
- Muncul di riwayat sebagai jenis “Pemasukan Lain”

#### F. Pengeluaran
- Form: tanggal, nominal, kategori, keterangan, bukti (opsional)
- Kategori bisa dikelola di pengaturan (list sederhana)

#### G. Pengaturan
| Setting | Default / catatan |
|---|---|
| Nama paguyuban / kelas | SAID BIN HARITS — KBIT Mutiara Hati |
| Tahun ajaran aktif | mis. 2025/2026 |
| Nominal iuran bulanan | Rp 20.000 (bisa diubah) |
| Bulan tagihan aktif | rentang bulan dalam tahun ajaran |
| Info rekening transfer | bank, no. rek, atas nama (tampil di publik, opsional) |
| Kategori pengeluaran | list editable |
| Akun admin | kelola user admin sederhana |

**Aturan ubah nominal iuran**
- Perubahan nominal **berlaku untuk tagihan bulan yang belum dibuat / belum ada pembayaran**.
- Tagihan yang sudah ada pembayaran **tidak diubah otomatis** (hindari kacau histori).
- Admin bisa regenerate / sesuaikan tagihan bulan depan secara eksplisit.

#### H. Export
- Export Excel: rekap iuran per bulan, daftar transaksi, ringkas saldo
- Export PDF: laporan bulanan rapi (kop sederhana: nama kelas + periode + saldo)

---

## 8. Alur Utama (Happy Path)

### 8.1 Setup awal (admin)
1. Login admin
2. Isi pengaturan: tahun ajaran, nominal iuran Rp 20.000, info rekening
3. Input daftar siswa kelas
4. Sistem siapkan tagihan bulanan (atau generate per bulan saat dibuka)

### 8.2 Catat bayar iuran
1. Admin buka “Bayar Iuran”
2. Pilih siswa + bulan
3. Pilih metode (Tunai/Transfer), isi nominal & tanggal
4. (Opsional) unggah bukti
5. Simpan → status update → saldo naik → tampil di publik

### 8.3 Catat pengeluaran
1. Admin buka “Pengeluaran”
2. Isi nominal, kategori, keterangan, tanggal
3. Simpan → saldo turun → tampil di riwayat publik

### 8.4 Wali cek status
1. Wali buka link web (dari grup WA)
2. Lihat saldo & progress lunas bulan ini
3. Cari nama anak → lihat status bayar
4. Buka riwayat untuk lihat pengeluaran kelas

---

## 9. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| **Platform** | Web app responsive (mobile-first) |
| **Browser** | Chrome, Safari, Edge (versi modern) |
| **Performa** | Dashboard & list status load < 3 detik (untuk ~30 siswa) |
| **Keamanan** | Admin password di-hash; endpoint tulis dilindungi auth; CSRF/basic hardening |
| **Privasi** | Tidak simpan data sensitif berlebih; akses publik read-only |
| **Backup** | Export manual + backup DB berkala (ops deploy) |
| **Bahasa UI** | Bahasa Indonesia |
| **Timezone / format** | Asia/Jakarta; mata uang Rp (IDR) |
| **Aksesibilitas dasar** | Tombol cukup besar di HP, kontras jelas |

---

## 10. Model Data (ringkas)

### Entitas utama
- **User (Admin)** — id, username, password_hash, nama, role (`ketua`/`bendahara`), created_at
- **Setting** — key/value atau row tunggal konfigurasi kelas
- **Siswa** — id, nama, nama_panggilan, nama_wali, aktif, catatan
- **TagihanIuran** — id, siswa_id, tahun_ajaran, bulan, nominal, status, total_bayar
- **Transaksi** — id, tipe (`iuran` | `pemasukan_lain` | `pengeluaran`), tanggal, nominal, metode, keterangan, kategori (utk pengeluaran), siswa_id (jika iuran), tagihan_id (jika iuran), bukti_url, created_by, created_at
- **KategoriPengeluaran** — id, nama

### Aturan
- Soft delete untuk siswa & transaksi bila perlu audit
- Nominal selalu integer (rupiah tanpa desimal)
- Satu tagihan unik per (siswa, tahun_ajaran, bulan)

---

## 11. Wireframe / Struktur Halaman

```
PUBLIK (/)  ← halaman awal saat web dibuka
├── Header: judul + TA · tombol Admin
├── Dashboard
├── Status Iuran (filter bulan)
└── Riwayat Transaksi (filter bulan & jenis)

ADMIN (/admin)
├── Login (dari tombol Admin di header publik)
├── Dashboard
├── Siswa
├── Bayar Iuran
├── Pemasukan Lain
├── Pengeluaran
├── Laporan & Export
└── Pengaturan
```

---

## 12. Desain & UX (arah)

**Tema dikunci:** [theme.md](theme.md) — **Mutiara Light** v1.0  
**Mockup UI:** [mockup/publik.html](mockup/publik.html) — entry = halaman publik; Admin di header

- Base light/putih, aksen **teal `#0D9488`**, kekayaan warna sedang
- Soft rounded (radius kartu 16px, kontrol 12px), shadow lembut
- Mobile-first: satu kolom di HP, kartu status mudah dibaca
- Warna status konsisten:
  - Hijau = Lunas
  - Amber = Sebagian
  - Abu netral = Belum (bukan merah agresif)
- Angka uang selalu format `Rp 20.000` (`id-ID`)
- Hindari jargon teknis; label tombol jelas (“Catat Bayar”, “Simpan Pengeluaran”)
- Dark mode & gradient ramai: **tidak** di MVP

---

## 13. Asumsi & Dependensi

### Asumsi
- Jumlah siswa kelas kecil–sedang (orientasi ~15–30 anak)
- Satu kelas saja: SAID BIN HARITS
- Admin sanggup input manual pembayaran (tidak butuh otomatisasi bank)
- Wali cukup nyaman buka link di browser HP
- Satu tahun ajaran dulu sudah cukup untuk v1

### Dependensi
- Hosting web + database (bisa dipilih saat implementasi: mis. Vercel/Railway + Postgres/SQLite)
- Storage untuk bukti transfer (lokal/S3/cloudinary) — boleh ditunda; bukti opsional di MVP ketat

---

## 14. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Link publik tersebar luas | Data kelas terbaca orang luar | Jangan tampilkan data sensitif; opsi v1.1: PIN halaman publik |
| Admin lupa password | Tidak bisa input | Seed 2 admin; fitur reset manual di DB / superadmin |
| Salah input nominal | Saldo salah | Edit/batal transaksi + konfirmasi hapus |
| Ubah iuran di tengah tahun | Bingung tagihan lama | Aturan: tidak rewrite tagihan yang sudah bertransaksi |
| Bukti transfer besar | Storage penuh | Batasi ukuran file; kompres; atau bukti opsional dulu |

---

## 15. Roadmap

### Fase 1 — MVP (inti)
- Auth admin
- CRUD siswa
- Pengaturan (nominal iuran, tahun ajaran, rekening)
- Tagihan + catat pembayaran iuran
- Pemasukan lain + pengeluaran
- Dashboard & status lunas/belum (publik)
- Riwayat transaksi (publik)
- Responsive UI

### Fase 2 — Laporan & polish
- Export Excel & PDF
- Filter/search lebih nyaman
- Upload bukti transfer
- Audit log sederhana (siapa ubah apa)

### Fase 3 — Peningkatan (opsional)
- PIN untuk halaman publik
- Multi tahun ajaran
- Notifikasi / template pesan WA (copy-paste) untuk penagihan
- Import siswa dari Excel
- Dashboard grafik sederhana

---

## 16. Kriteria Penerimaan MVP

MVP dianggap selesai jika:
1. Admin bisa login/logout.
2. Admin bisa menambah minimal 1 siswa dan mencatat iuran bulanan.
3. Nominal iuran default Rp 20.000 dan bisa diubah di pengaturan.
4. Pembayaran tunai & transfer bisa dicatat; status siswa berubah ke Lunas/Sebagian/Belum dengan benar.
5. Pemasukan lain & pengeluaran mempengaruhi saldo dengan benar.
6. Tanpa login, wali bisa melihat: saldo, status bayar per bulan, riwayat transaksi.
7. Tampilan usable di HP.
8. Export minimal satu format (Excel atau PDF) tersedia, idealnya keduanya.
9. Bahasa UI Indonesia; format uang & tanggal lokal.

---

## 17. Open Questions (bisa diputuskan saat dev)

1. Kalender tagihan: Juli–Juni atau Januari–Desember?
2. Apakah nama wali wajib diisi di data siswa?
3. Perlukah menampilkan info rekening di halaman publik?
4. Preferensi stack teknis (jika ada): mis. Next.js, Laravel, dll. — atau bebas selama web & mudah di-deploy?
5. Hosting target (gratis dulu vs berbayar kecil)?

---

## 18. Lampiran — Ringkasan Keputusan Produk

| Topik | Keputusan |
|---|---|
| Organisasi | Paguyuban kelas SAID BIN HARITS — KBIT Mutiara Hati |
| Platform | Web (HP & laptop) |
| Akses wali | Tanpa login, read-only |
| Akses ubah data | Hanya ketua & bendahara (admin login) |
| Iuran rutin | Ya, per bulan, default Rp 20.000, editable di pengaturan |
| Pemasukan lain | Ya |
| Pengeluaran | Ya, dengan kategori |
| Cara bayar | Transfer/e-wallet + Tunai |
| Laporan | Dashboard, daftar lunas/belum, export Excel/PDF |
| Periode | Satu tahun ajaran dulu |
| Notifikasi WA otomatis | Tidak di MVP |

---

*Dokumen ini menjadi acuan implementasi. Perubahan requirement harap di-update di versi PRD berikutnya.*
