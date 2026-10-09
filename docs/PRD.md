# Product Requirements Document (PRD)

## 1. Product Overview
**Momentum** adalah platform pelacak kebiasaan (*Habit Tracker*) modern berbasis web yang mengombinasikan **Dopamine-Driven UX**, **Optimistic UI berkecepatan tinggi**, visualisasi konsistensi ala **GitHub Heatmap**, serta **Universal Multi-Model AI** yang didukung oleh **9Router, Google Gemini, Anthropic Claude, OpenAI, DeepSeek, Groq, n8n**, dan **Nous Research Hermes Agent**.

---

## 2. Target Audience
- **Developer & Tech Enthusiast**: Pengguna yang menyukai visualisasi ala GitHub Heatmap, kontrol keyboard, dan otomatisasi bot WhatsApp/Telegram.
- **Productivity & Self-Improvement Enthusiast**: Individu yang ingin membangun rutinitas konsisten tanpa rasa bosan checklist konvensional.
- **Students & Remote Workers**: Pengguna yang membutuhkan umpan balik psikologis positif dan dorongan motivasi harian.

---

## 3. Core Loop & User Journey
1. **Pendaftaran Cepat**: Login instan melalui Google OAuth atau kredensial email via Better Auth.
2. **Perancangan Kebiasaan (Manual atau AI Magic Create)**: Pengguna membuat habit manual atau cukup mengetik satu kalimat impian (contoh: *"Belajar Vue 3"*), lalu AI merancang kategori habit dan subtask mikro.
3. **Daily Check-in (Instant Gratification)**: Pengguna mencentang rutinitas harian dengan respon instan 0ms (Optimistic UI) disertai efek audio *tick* atau *complete*.
4. **Visual Reward & Consistency Chain**: Heatmap kontribusi terisi dan angka streak bertambah.
5. **AI Reflection & Cognitive Coaching**: Setiap minggu atau harian, AI mengevaluasi pola konsistensi pengguna dan agen Hermes memberikan bimbingan kognitif untuk mencegah *burnout*.
6. **Omnichannel Interaction**: Pengguna dapat mencentang kebiasaan langsung dari WhatsApp/Telegram melalui automasi n8n.

---

## 4. Epics & User Stories

### Epic 1: Autentikasi & Akun
- **US 1.1**: Sebagai user, saya dapat mendaftar dan login menggunakan Google OAuth atau Email/Password.
- **US 1.2**: Sebagai user, saya dapat melakukan *forgot password* dan mereset kata sandi via email token.
- **US 1.3**: Sebagai user, sesi login saya tetap tersimpan dengan aman menggunakan HTTP-only cookie.

### Epic 2: Manajemen Habit & Subtask
- **US 2.1**: Sebagai user, saya dapat membuat habit baru dengan kustomisasi nama, warna, ikon, dan deskripsi.
- **US 2.2**: Sebagai user, saya dapat memecah kebiasaan besar menjadi daftar subtask mikro terperinci.
- **US 2.3**: Sebagai user, saya dapat menyusun ulang urutan habit dan subtask dengan drag-and-drop.
- **US 2.4**: Sebagai user, saya dapat mengedit atau menghapus habit (penghapusan cascade pada subtask dan log).

### Epic 3: Check-in, Heatmap & Audio Feedback
- **US 3.1**: Sebagai user, ketika saya mencentang task, UI langsung berubah seketika tanpa loading spinner (Optimistic UI).
- **US 3.2**: Sebagai user, setiap aksi check-in memainkan efek suara prosedural Web Audio yang memuaskan.
- **US 3.3**: Sebagai user, saya dapat melihat riwayat konsistensi 365 hari dalam bentuk GitHub-style Heatmap.
- **US 3.4**: Sebagai user, saya dapat meninjau riwayat tanggal sebelumnya di halaman History.

### Epic 4: Universal Multi-Model AI Engine
- **US 4.1**: Sebagai user, saya dapat membuat rencana kebiasaan instan menggunakan fitur *Magic Create* yang didukung model AI pilihan (9Router, Gemini, Claude, GPT, DeepSeek, Groq, Ollama).
- **US 4.2**: Sebagai user, saya dapat meminta *Weekly Review* untuk menganalisis performa 7 hari terakhir.
- **US 4.3**: Sebagai user, saya dapat meminta tips motivasi harian (*Daily Tip*).
- **US 4.4**: Sebagai user, jika salah satu penyedia AI mengalami limit, sistem secara transparan beralih ke penyedia cadangan (*Cascading Fallback*).

### Epic 5: Omnichannel Automation (n8n Integration)
- **US 5.1**: Sebagai user, setiap kali saya menyelesaikan tugas di Momentum, event dikirim ke n8n untuk integrasi notifikasi (misal: WhatsApp/Telegram/Discord).
- **US 5.2**: Sebagai user, saya dapat mencentang tugas melalui bot chat n8n dengan pencarian judul cerdas.

### Epic 6: Agen Otonom Hermes (Cognitive Habit Coach)
- **US 6.1**: Sebagai sistem, endpoint telemetry menyediakan analisis drop-off day, kluster waktu produktif, dan level risiko burnout untuk agen Hermes.
- **US 6.2**: Sebagai user, agen Hermes memberikan dorongan berbasis Cognitive Behavioral Therapy (CBT).

### Epic 7: Tema & Kustomisasi UI
- **US 7.1**: Sebagai user, saya dapat memilih dari 18 palet warna aksen yang tersimpan otomatis di browser.
- **US 7.2**: Sebagai user, saya dapat berganti antara mode gelap (Dark Mode) dan terang (Light Mode).
- **US 7.3**: Pengunjung tanpa login dapat mencoba aplikasi melalui *Demo Mode*.
