# UI & UX Guidelines (Bento-Box Vibe)

## 1. Design Philosophy (Dribbble Inspired)
Aplikasi mengusung gaya **Bento-Box UI** yang modern, bersih, dan sangat responsif. Berbeda dengan pendekatan *dark mode developer tools* sebelumnya, versi ini lebih *vibrant* dan *playful*.
- **Widget-centric**: Elemen UI dibungkus dalam kartu (cards) dengan ukuran bervariasi yang membentuk grid rapi (seperti bento).
- **Soft & Inviting**: Menggunakan sudut melengkung besar (`rounded-3xl` atau `rounded-2xl`) dengan bayangan halus (`shadow-sm` atau *custom drop shadow*).
- **Whitespace is King**: Jarak antar elemen sangat lapang (`gap-6`, `p-6`) untuk memberikan kesan premium dan lega.

## 2. Color Palette
- **Background Utama**: Abu-abu sangat terang atau *off-white* (`bg-gray-50` atau `#F7F8FA`).
- **Cards**: Putih solid (`bg-white`) agar elemen konten menonjol.
- **Accent Colors (Vibrant & Pastel)**: 
  - *Orange Pastel* (`#FFB38E` atau `orange-400`) untuk CTA utama atau elemen *attention*.
  - *Soft Yellow* (`#FDE68A`) untuk *weather* atau cuaca.
  - *Emerald Green* (`#34D399`) untuk status selesai/sukses.
  - *Red/Pink Pastel* (`#FB7185`) untuk integrasi atau notifikasi.

## 3. Typography
- **Primary Font**: `Inter`, `Poppins`, atau font *sans-serif* membulat yang terlihat modern dan bersahabat.
- **Warna Teks**: Abu-abu gelap (`text-gray-900`) untuk judul, abu-abu medium (`text-gray-500`) untuk deskripsi atau label sekunder.

## 4. Komponen Utama
- **Card**: Kotak dengan `bg-white rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100`.
- **Button**: Bentuk pil memanjang (`rounded-full`) dengan warna solid atau outline, ukurannya besar (tinggi `h-12`) agar mudah ditekan di layar sentuh.
- **Habit Checkbox**: Menggunakan kotak yang berubah warna menjadi hijau atau muncul centang saat ditekan (Optimistic UI).

## 5. Responsive Layout
- **Mobile**: Tampilan di-stack satu kolom ke bawah. *Card* memiliki margin penuh.
- **Tablet**: Menggunakan grid 2 kolom.
- **Desktop**: Grid 3 hingga 4 kolom, membentuk susunan *bento box* layaknya *dashboard* produktivitas (seperti contoh Dribbble).
