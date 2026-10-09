# Momentum - Software Design Document (SDD) v3

## 1. Project Overview
- **Nama Proyek:** Momentum
- **Kategori:** AI-Powered Habit Tracker & Behavioral Consistency Platform
- **Visi:** Memberikan pengalaman membangun kebiasaan dengan *Dopamine-Driven UX*, interaksi tanpa latensi (*Optimistic UI*), visualisasi 365 hari ala GitHub Heatmap, serta ekosistem cerdas berbasis **9Router, Multi-Model AI (Gemini, Claude, GPT, DeepSeek, Groq, Ollama)**, **n8n Automation**, dan **Nous Research Hermes Agent**.

---

## 2. Tech Stack & Dependensi

| Layer | Teknologi & Versi | Catatan Implementasi |
|---|---|---|
| **Runtime & PM** | Bun (`^1.1.27`) | Digunakan untuk runtime, instalasi dependensi, dan eksekusi skrip |
| **Fullstack Framework** | Nuxt 4 (`^4.4.6`) | Arsitektur modular frontend Vue 3.5 & backend Nitro |
| **Bahasa** | TypeScript 5.8+ | Mode ketat (*strict mode*), 100% type-safe |
| **UI & Styling** | Nuxt UI v4 (`@nuxt/ui: ^4.8.0`) + Tailwind CSS v4 (`^4.3.0`) | Sistem token semantik (`primary`, `neutral`, `error`, `success`, `info`, `warning`) |
| **Database & ORM** | PostgreSQL + Drizzle ORM (`^0.45.0`) | Tanpa overhead berat, kueri SQL type-safe |
| **Autentikasi** | Better Auth (`^1.4.19`) | Manajemen sesi aman via cookie, integrasi Google OAuth & Kredensial |
| **Multi-Model AI** | Universal Engine (`server/utils/ai.ts`) | Mendukung 9Router, Gemini, Claude, OpenAI, DeepSeek, Groq, OpenRouter, Ollama |
| **Automasi** | n8n Webhook Dispatcher & Receiver | Outbound event bus dan inbound action controller |
| **Autonomous Agent** | Nous Research Hermes Telemetry | Endpoint agregasi metrik kebiasaan & sinyal burnout |
| **Audio Synthesis** | Web Audio API (`app/utils/sound.ts`) | Generator suara prosedural bebas aset eksternal |

---

## 3. Komponen Arsitektur Sistem

### 3.1. Frontend Architecture
- **Pages**: Menggunakan Nuxt file-based routing di dalam folder `app/pages/`.
  - Landing (`index.vue`), Dashboard (`dashboard/index.vue`), Riwayat (`dashboard/history.vue`), Akun (`dashboard/account.vue`), Auth (`login.vue`, `register.vue`, `forgot-password.vue`, `reset-password.vue`), Test Gateway (`groq-test.vue`), Demo Mode (`demo.vue`), Feedback (`feedback.vue`).
- **Layouts**: `app/layouts/dashboard.vue`, `app/layouts/auth.vue`, `app/layouts/default.vue`.
- **Theme System**: Composable `useTheme.ts` mengelola 18 pilihan palet warna dan menyuntikkan variabel CSS `--color-primary-*` ke `:root` secara dinamis dengan persistensi `localStorage`.
- **Optimistic State Management**: State habit dikelola secara reaktif. Perubahan centang langsung memicu update visual instan dan efek suara dalam 0ms, sementara sinkronisasi HTTP berjalan di latar belakang.

### 3.2. Server Layer (Nitro)
- **H3 Event Handlers**: Seluruh endpoint RESTful didefinisikan di `server/api/`.
- **Database Connection**: Pool koneksi PostgreSQL diinisialisasi melalui `server/utils/db.ts` dan diakses oleh Drizzle ORM.
- **Session Validation**: Middleware autentikasi memvalidasi sesi Better Auth sebelum mengizinkan mutasi data habit.

### 3.3. Universal AI Subsystem
- **Gateway Default**: Secara default diarahkan ke 9Router (`http://localhost:20128/v1`) untuk efisiensi token, caching prompt, dan kontrol kuota.
- **Cascading Failover**: Jika sebuah model gagal (error 429 atau timeout), fungsi `executeAICompletionWithFallback` secara otomatis mencoba model aktif berikutnya.
- **JSON Sanitization**: Parser `extractJSONFromAIResponse` menjamin payload JSON dari AI bebas dari karakter markdown backtick sebelum dikirim ke client.

### 3.4. n8n Automation Engine
- **Event Bus Outbound**: Ketika task diselesaikan atau dibatalkan, `server/utils/events.ts` memanggil webhook n8n secara non-blocking (*fire-and-forget*).
- **Inbound Action Controller**: Webhook di `server/api/integrations/n8n.post.ts` menerima aksi dari n8n untuk WhatsApp bot (baca summary, centang task via pencarian judul fuzzy, buat habit baru).

### 3.5. Hermes Cognitive Agent
- Endpoint `server/api/agent/habits.get.ts` mengekstrak data telemetry:
  - Menghitung rasio penyelesaian 7 hari terakhir.
  - Mendeteksi hari paling rentan gagal (*drop-off day*).
  - Mengelompokkan jam aktif pengguna (*morning*, *afternoon*, *evening*, *night*).
  - Menentukan level risiko kejenuhan (*burnout risk*).

---

## 4. Keamanan & Kepatuhan
1. **Proteksi Rahasia & API Keys**: Kunci rahasia AI dan Webhook Secret hanya dibaca di sisi server (Nitro runtime config) dan tidak pernah bocor ke bundle client.
2. **Keamanan Sesi**: Cookie sesi Better Auth dikonfigurasi dengan flag `HttpOnly`, `SameSite=Lax`, dan `Secure` pada mode produksi.
3. **Pembersihan Input**: Validasi input ketat pada setiap mutasi data untuk mencegah injeksi SQL dan XSS.
