# UI & UX Guidelines (Bento-Box & Dopamine-Driven)

## 1. Filosofi Desain

Momentum mengusung prinsip **Dopamine-Driven UX** dengan tata letak bergaya **Bento-Box UI**:
- **Widget-Centric Bento Layout**: Seluruh modul fungsional dibungkus dalam kartu (*cards*) dengan rasio proporsional, sudut membulat lebar (`rounded-2xl` atau `rounded-3xl`), dan bayangan lembut (*soft ambient shadows*).
- **Zero-Latency Feel (Optimistic UI)**: Pengguna tidak boleh menunggu *loading spinner* untuk aksi harian seperti mencentang rutinitas. Respon visual terjadi dalam 0 milidetik.
- **Multi-Sensory Gratification**: Setiap keberhasilan menyelesaikan tugas diperkuat dengan efek suara prosedural Web Audio yang memicu kepuasan psikologis.

---

## 2. Sistem Warna Semantik (Nuxt UI v4 & Tailwind CSS v4)

Aplikasi telah sepenuhnya mengadopsi token semantik resmi **Nuxt UI v4**:

| Token Semantik | Peruntukan Utama | Contoh Nilai Default |
|---|---|---|
| `primary` | Tombol CTA utama, status aktif, highlight streak, fokus visual | Dinamis sesuai tema aktif (default: Indigo/Violet) |
| `neutral` | Background kartu, teks sekunder, border halus, badge netral | Zinc / Slate |
| `success` | Indikator habit selesai, kontribusi penuh di heatmap | Emerald / Green |
| `warning` | Peringatan streak hampir putus, konfirmasi penting | Amber / Yellow |
| `error` | Notifikasi gagal, tombol hapus, badge alert bahaya | Rose / Red |
| `info` | Banner informasi tips harian, badge bantuan AI | Sky / Cyan |

---

## 3. Sistem Tema Dinamis (18 Pilihan Palet)

Pengguna dapat memilih warna aksen personal melalui `UnifiedThemePicker`. Sistem tema menginjeksi variabel CSS langsung ke root DOM:
- **Pilihan Warna**: Indigo, Violet, Purple, Fuchsia, Pink, Rose, Red, Orange, Amber, Yellow, Lime, Green, Emerald, Teal, Cyan, Sky, Blue, Gray.
- **Persistensi**: Disimpan di `localStorage` dan langsung direstorasi saat halaman dimuat ulang tanpa kedipan (*flash of unstyled content*).
- **Skala Otomatis**: Menghasilkan seluruh tingkatan warna dari `50` hingga `950` secara procedural.

---

## 4. Efek Suara Prosedural (Web Audio Haptics)

Momentum menyematkan engine audio berbasis Web Audio API murni di [`app/utils/sound.ts`](file:///D:/Works/Project/Nuxt.JS/momentum_habit_tracker_plan/app/utils/sound.ts), tanpa membutuhkan download file audio eksternal:

| Tipe Suara | Pola Gelombang | Momen Pemutaran |
|---|---|---|
| `'tick'` | *Sine wave blip* 800Hz $\rightarrow$ 1200Hz (60ms) | Ketika satu subtask dicentang |
| `'complete'` | Arpeggio 3 nada naik (*Major triad*: 523Hz, 659Hz, 784Hz) | Ketika seluruh subtask dalam 1 habit selesai hari ini |
| `'streak'` | Nada energetik 4 nada naik dengan reverb singkat | Ketika streak harian bertambah |
| `'undo'` | Nada turun lembut 600Hz $\rightarrow$ 300Hz (70ms) | Ketika centang dibatalkan |

---

## 5. Tata Letak Responsif (Grid Breakpoints)

- **Mobile (< 768px)**:
  - Tampilan satu kolom ke bawah (*vertical stack*).
  - Target sentuh lebar (minimal tinggi 48px) agar nyaman untuk ibu jari.
  - Heatmap dapat digeser secara horizontal (*overflow-x auto*) dengan scrollbar tersembunyi.
- **Tablet (768px - 1024px)**:
  - Grid 2 kolom seimbang untuk kartu habit.
  - Navigasi atas ringkas dengan popover profil.
- **Desktop (> 1024px)**:
  - Tata letak Bento Grid lengkap.
  - Kartu Habit ditampilkan dalam 2 kolom kartu besar dengan daftar subtask interaktif.
  - Panel Heatmap dan AI Motivation bertengger di bagian atas untuk visibilitas maksimal.
