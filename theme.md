# Design Theme — Kas Paguyuban SAID BIN HARITS

| Field | Value |
|---|---|
| **Nama tema** | Mutiara Light |
| **Versi** | 1.0 |
| **Tanggal** | 20 Juli 2026 |
| **Status** | Locked |
| **Acuan PRD** | [prd.md](prd.md) |

---

## 1. Arah visual

| Aspek | Keputusan |
|---|---|
| Mood | Bersih, tepercaya, ramah orang tua, cocok KBIT |
| Base | Light / putih dominan |
| Kekayaan warna | Sedang — aksen jelas, tidak ramai |
| Gaya komponen | Soft rounded (modern app) |
| Prioritas layar | Mobile-first (HP wali murid) |
| Bahasa UI | Indonesia |

**Tidak dipakai di MVP:** dark mode, gradient ramai, warna pelangi, header full-bleed gelap.

---

## 2. Palet warna

### Core
| Token | Hex | CSS variable (usulan) | Pemakaian |
|---|---|---|---|
| Background | `#F8FAFC` | `--color-bg` | Latar halaman |
| Surface | `#FFFFFF` | `--color-surface` | Kartu, modal, form, header |
| Border | `#E2E8F0` | `--color-border` | Garis, outline input |
| Text primary | `#0F172A` | `--color-text` | Judul, saldo, nama |
| Text secondary | `#64748B` | `--color-text-muted` | Label, meta, placeholder |
| Accent | `#0D9488` | `--color-accent` | Tombol utama, link, progress, highlight |
| Accent soft | `#CCFBF1` | `--color-accent-soft` | Chip/background aksen lembut |
| Accent hover | `#0F766E` | `--color-accent-hover` | Hover/pressed tombol utama |

### Semantic (status & transaksi)
| Token | Hex | CSS variable | Pemakaian |
|---|---|---|---|
| Success | `#16A34A` | `--color-success` | Badge **Lunas**, konfirmasi sukses |
| Success soft | `#DCFCE7` | `--color-success-soft` | Background badge Lunas |
| Warning | `#D97706` | `--color-warning` | Badge **Sebagian** |
| Warning soft | `#FEF3C7` | `--color-warning-soft` | Background badge Sebagian |
| Neutral | `#94A3B8` | `--color-neutral` | Badge **Belum** (tidak menuduh) |
| Neutral soft | `#F1F5F9` | `--color-neutral-soft` | Background badge Belum |
| Income | `#059669` | `--color-income` | Nominal pemasukan (+) |
| Expense | `#DC2626` | `--color-expense` | Nominal pengeluaran (−) |
| Danger | `#DC2626` | `--color-danger` | Hapus, error form |
| Danger soft | `#FEE2E2` | `--color-danger-soft` | Background error / tombol bahaya soft |

### Aturan warna
1. **Putih/surface mendominasi** — aksen teal hanya untuk aksi & penanda penting.
2. Status **Belum** pakai abu (`neutral`), bukan merah agresif.
3. Merah khusus untuk **pengeluaran** dan aksi berbahaya (hapus).
4. Kontras teks pada tombol aksen: **putih** di atas `#0D9488`.

---

## 3. Tipografi

| Peran | Size | Weight | Keterangan |
|---|---|---|---|
| Saldo utama | 28–36px | Bold (700) | Angka kas di dashboard |
| Judul halaman | 18–20px | Semibold (600) | Nama halaman / section |
| Judul kartu | 14–16px | Semibold (600) | Label di dalam card |
| Body | 14–16px | Regular (400) | Konten umum |
| Caption / meta | 12–13px | Regular (400) | Tanggal, metode, helper |
| Badge | 12px | Medium (500) | Lunas / Sebagian / Belum |

**Font stack (MVP)**
```css
font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, "Noto Sans", sans-serif;
```

Opsional polish: **Inter** bila ingin lebih “app product”.

**Format angka**
- Mata uang: `Rp 20.000` (titik ribuan, tanpa desimal)
- Locale: `id-ID`
- Timezone tampilan: `Asia/Jakarta`

---

## 4. Spacing, radius, shadow

### Spacing scale (usulan)
`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48`

| Konteks | Nilai |
|---|---|
| Padding kartu | 16–20px |
| Gap antar kartu | 12–16px |
| Margin section | 24px |
| Padding halaman (HP) | 16px |

### Radius
| Elemen | Radius |
|---|---|
| Kartu / modal | 16px |
| Input / select | 12px |
| Tombol | 12px |
| Badge / pill | 999px |
| Avatar / ikon bulat | 999px |
| Progress bar | 999px |

### Shadow
| Level | Value | Pakai |
|---|---|---|
| Soft | `0 1px 3px rgba(15, 23, 42, 0.06)` | Kartu default |
| Medium | `0 4px 12px rgba(15, 23, 42, 0.08)` | Modal, dropdown |
| Focus ring | `0 0 0 3px rgba(13, 148, 136, 0.25)` | Input/tombol fokusokus |

Hindari shadow tebal / warna-warni.

---

## 5. Komponen kunci

### Header publik
- Background: surface putih
- Border bawah tipis (`--color-border`)
- Judul: **Kas Paguyuban**
- Subtitle: `SAID BIN HARITS · KBIT Mutiara Hati`
- Tanpa header gelap full-width

### Kartu saldo
- Surface putih, radius 16, shadow soft
- Label kecil abu: “Saldo kas”
- Angka besar gelap
- Baris sekunder: total masuk (hijau) · total keluar (merah)

### Badge status
| Status | Teks | Warna teks | Background |
|---|---|---|---|
| Lunas | Lunas | `#16A34A` | `#DCFCE7` |
| Sebagian | Sebagian | `#D97706` | `#FEF3C7` |
| Belum | Belum | `#64748B` | `#F1F5F9` |

### Tombol
| Varian | Style |
|---|---|
| Primary | BG accent, teks putih, hover accent-hover |
| Secondary | BG putih, border, teks primary |
| Ghost | Transparan, teks accent |
| Danger | BG danger soft / outline danger |
| Tinggi minimum | ~44px (nyaman di HP) |

### Form
- Label di atas input
- Border `border`, focus ring teal
- Error: border danger + teks helper merah
- Placeholder: text secondary

### Progress iuran
- Track: `#E2E8F0`
- Fill: accent teal
- Label: `18/22 lunas` + persen

### List siswa / transaksi
- Baris clean, separator border tipis
- Kiri: nama / keterangan
- Kanan: badge atau nominal berwarna
- Search input di atas list (HP-friendly)

### Navigasi
- Publik: tab/bottom-nav sederhana — Dashboard · Status Iuran · Riwayat
- Admin: sidebar (desktop) / drawer (HP) setelah login

---

## 6. Layout

```
Mobile-first
├── max content width ~480–640px terasa ideal di HP
├── desktop: content center / max ~960–1100px untuk admin tabel
└── satu kolom di HP; grid 2 kolom untuk ringkasan di tablet+
```

Struktur publik:
```
Header
Dashboard (saldo + ringkas bulan)
Status Iuran (filter bulan + list)
Riwayat (filter + list)
```

---

## 7. Ikon & ilustrasi

- Ikon outline/simple (lucide / heroicons style)
- Sedikit ikon saja: saldo, masuk, keluar, search, filter, settings
- Tanpa ilustrasi berat di MVP
- Hindari emoji berlebihan di UI inti (boleh sparingly di empty state)

---

## 8. Accessibility dasar

- Kontras teks utama pada putih ≥ standar AA
- Tombol/tap target ≥ 44×44px di HP
- Fokus keyboard terlihat (ring teal)
- Jangan andalkan warna saja: badge status tetap berteks (“Lunas”, bukan hanya hijau)
- Format uang & tanggal konsisten

---

## 9. Cuplikan CSS tokens (siap tempel)

```css
:root {
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-border: #E2E8F0;
  --color-text: #0F172A;
  --color-text-muted: #64748B;

  --color-accent: #0D9488;
  --color-accent-soft: #CCFBF1;
  --color-accent-hover: #0F766E;

  --color-success: #16A34A;
  --color-success-soft: #DCFCE7;
  --color-warning: #D97706;
  --color-warning-soft: #FEF3C7;
  --color-neutral: #94A3B8;
  --color-neutral-soft: #F1F5F9;

  --color-income: #059669;
  --color-expense: #DC2626;
  --color-danger: #DC2626;
  --color-danger-soft: #FEE2E2;

  --radius-card: 16px;
  --radius-control: 12px;
  --radius-pill: 999px;

  --shadow-soft: 0 1px 3px rgba(15, 23, 42, 0.06);
  --shadow-medium: 0 4px 12px rgba(15, 23, 42, 0.08);
  --ring-accent: 0 0 0 3px rgba(13, 148, 136, 0.25);

  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}
```

---

## 10. Mood reference (teks)

```
┌──────────────────────────────────┐
│  Kas Paguyuban                   │  surface + border
│  SAID BIN HARITS · KBIT          │  text-muted subtitle
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │ Saldo kas                  │  │
│  │ Rp 1.240.000               │  │  text primary bold
│  │ + Rp 400rb   − Rp 160rb    │  │  income / expense
│  └────────────────────────────┘  │
│                                  │
│  Iuran Juli · 18/22 lunas        │
│  [████████████░░░░] 82%          │  accent fill
│                                  │
│  Ahmad F.     [ Lunas ]          │  success soft
│  Budi S.      [ Sebagian ]       │  warning soft
│  Citra A.     [ Belum ]          │  neutral soft
└──────────────────────────────────┘
 bg #F8FAFC · accent #0D9488 · soft rounded
```

---

## 11. Keputusan terkunci

| Topik | Nilai |
|---|---|
| Nama tema | **Mutiara Light** |
| Base | Light / putih |
| Aksen | **Teal `#0D9488`** |
| Intensitas warna | Sedang |
| Komponen | Soft rounded, shadow lembut |
| Status Belum | Abu netral (bukan merah) |
| Dark mode | Tidak di MVP |

Perubahan tema setelah ini = major design change; update versi dokumen ini.

---

*Dokumen ini acuan UI implementation. Sinkron dengan [prd.md](prd.md).*
