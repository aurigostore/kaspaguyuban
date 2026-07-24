# Mockup UI — Kas Paguyuban SAID BIN HARITS

Wireframe interaktif tema **Mutiara Light** (bukan aplikasi final).

## Cara buka

1. Buka `index.html` atau `publik.html` di browser — **halaman awal = publik**.
2. Tombol **Admin** ada di header kanan (menggantikan badge TA).
3. Tahun ajaran ditampilkan di subtitle judul.

```bash
start mockup/index.html
# atau
start mockup/publik.html
```

## Halaman

| File | Isi |
|---|---|
| `index.html` | Redirect ke `publik.html` (entry point) |
| `publik.html` | **Home** — Dashboard · Status Iuran · Riwayat |
| `admin-login.html` | Form login admin |
| `admin.html` | Dashboard, Siswa, Bayar Iuran, Pemasukan, Pengeluaran, Laporan, Pengaturan |
| `assets/theme.css` | Token & komponen tema Mutiara Light |

## Catatan

- Data **fiktif** (nama & nominal contoh).
- Tombol simpan/export **belum tersambung** backend.
- Acuan desain: `../theme.md` · acuan fitur: `../prd.md`
