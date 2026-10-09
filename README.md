<div align="center">

<img src="./public/banner.svg" alt="Momentum Header Banner" width="100%" />

<br />

[![Nuxt](https://img.shields.io/badge/Nuxt-4.4.6-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Nuxt UI](https://img.shields.io/badge/Nuxt_UI-v4.8-00DC82?logo=nuxt.js&logoColor=white)](https://ui.nuxt.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Fitur](#-fitur) · [Arsitektur AI](#-arsitektur-multi-provider-ai) · [Integrasi](#-integrasi-n8n--hermes) · [Setup & Menjalankan](#-setup--instalasi) · [Dokumentasi](./docs)

</div>

---

## 📖 Ringkasan

**Momentum** adalah aplikasi pelacak kebiasaan (*habit tracker*) berbasis web yang berfokus pada kecepatan respon dan kejelasan visual. Dibangun dengan Nuxt 4, Drizzle ORM, dan PostgreSQL, aplikasi ini menggunakan pola **Optimistic UI** (0ms latency), visualisasi kontribusi 365 hari ala GitHub Heatmap, audio feedback prosedural, serta arsitektur backend yang mendukung berbagai penyedia model AI tanpa keterikatan pada satu vendor.

---

## ✨ Fitur

- **Optimistic UI**: Perubahan status centang langsung diterapkan di antarmuka tanpa menunggu respons jaringan; sinkronisasi berjalan secara *asynchronous* di latar belakang.
- **365-Day GitHub Contribution Heatmap**: Visualisasi konsistensi harian dalam format kontribusi grid.
- **Sistem Hierarki Habit & Subtask**: Kategori kebiasaan dapat dipecah menjadi beberapa mikro-tugas terperinci dengan dukungan reorder drag-and-drop.
- **Synthesized Audio Feedback**: Efek suara prosedural berbasis Web Audio API murni (`tick`, `success`, `magic`, `uncheck`, `pop`) tanpa memuat aset audio eksternal.
- **Theme Engine**: 18 palet warna aksen Tailwind CSS yang dinamis dengan injeksi CSS variables dan persistensi di `localStorage`.
- **Autentikasi Terpadu**: Manajemen sesi aman berbasis cookie menggunakan Better Auth (kredensial email/password dan Google OAuth).
- **Settings Hub**: Halaman pengaturan di `/dashboard/settings` untuk mengelola API key, gateway endpoint, dan pengujian konektivitas secara langsung.

---

## 🤖 Arsitektur Multi-Provider AI

Momentum tidak mengikat sistem pada satu vendor AI. Backend menyediakan antarmuka terpadu via `server/utils/ai.ts` dengan fitur **cascading fallback** (otomatis beralih ke provider berikutnya jika provider utama mengalami *rate limit* atau gangguan jaringan).

| Provider | Dukungan Protokol | Endpoint / Target |
|---|---|---|
| **9Router Gateway** | OpenAI-Compatible | `http://localhost:20128/v1` (Proxy lokal/VPS dengan token saving) |
| **Google Gemini** | Generative AI API | `v1beta/openai` (`gemini-2.0-flash`, `gemini-1.5-pro`) |
| **Anthropic Claude** | Messages API Native | `/v1/messages` (`claude-3-5-sonnet`, `claude-3-5-haiku`) |
| **OpenAI** | Chat Completions | `/v1` (`gpt-4o`, `gpt-4o-mini`) |
| **DeepSeek** | OpenAI-Compatible | `/v1` (`deepseek-chat`, `deepseek-reasoner`) |
| **Groq Cloud** | OpenAI-Compatible | `/openai/v1` (`llama-3.3-70b-versatile`) |
| **OpenRouter** | Multi-vendor Proxy | `/api/v1` (Model auto-routing) |
| **Ollama** | Local Engine | `http://localhost:11434/v1` (On-device LLMs) |

### Fitur Fungsional AI:
- **Magic Create**: Menghasilkan draf habit dan subtask dari deskripsi singkat.
- **Weekly Review**: Analisis pola penyelesaian 7 hari terakhir.
- **Daily Tip**: Rekomendasi ringkas harian berbasis kebiasaan aktif.
- **Behavioral Reflection**: Evaluasi reflektif berbasis data log 30 hari.
- **Interactive Chat**: Asisten tanya-jawab mengenai konsistensi rutinitas.

---

## 🔌 Integrasi n8n & Hermes

### 1. n8n Automation Engine
- **Outbound Webhook**: Event aplikasi (`task.completed`, `habit.created`) dikirim ke n8n melalui `POST` request dengan proteksi header `X-Momentum-Secret`. Berguna untuk memicu notifikasi eksternal (Telegram, WhatsApp, Slack).
- **Inbound Webhook (`/api/integrations/n8n`)**: Menerima aksi dari n8n untuk integrasi bot:
  - `get_today_summary`: Membaca daftar tugas yang belum selesai hari ini.
  - `complete_task`: Mencentang tugas via ID atau pencarian judul mirip (*fuzzy search*).
  - `create_habit`: Menambahkan habit baru dari pesan bot.

### 2. Hermes Agent Telemetry (`/api/agent/habits`)
- Endpoint agregasi metrik kebiasaan untuk agen otonom Nous Research Hermes.
- Menyediakan data: persentase penyelesaian 7 hari, hari paling rentan bolong (*drop-off day*), kluster waktu produktif, dan level risiko kejenuhan (*burnout risk*).

---

## 🛠️ Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com) (`v4.4.6`) / [Vue 3.5](https://vuejs.org)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **UI Components**: [Nuxt UI v4](https://ui.nuxt.com) (`@nuxt/ui: ^4.8.0`)
- **CSS Engine**: [Tailwind CSS v4](https://tailwindcss.com) (`^4.3.0`)
- **Database & ORM**: PostgreSQL ([Supabase](https://supabase.com) / [Neon](https://neon.tech)) + [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: [Better Auth](https://better-auth.com)
- **Package Manager & Runtime**: [Bun](https://bun.sh) (`v1.1.27+`)

---

## 🚀 Setup & Instalasi

### 1. Prasyarat
- [Bun](https://bun.sh) (v1.0+)
- PostgreSQL Database instance

### 2. Instalasi Dependensi
```bash
# Clone repository
git clone https://github.com/RifkyA911/Momentum-Habit-Tracker-Plan.git
cd Momentum-Habit-Tracker-Plan

# Install dependencies
bun install

# Salin konfigurasi environment
cp .env.example .env
```

### 3. Konfigurasi Environment (`.env`)
Sesuaikan parameter database dan kunci autentikasi:

```env
# Database
DATABASE_URL=postgres://user:password@localhost:5432/momentum

# Better Auth
BETTER_AUTH_SECRET=your_random_secret_min_32_characters
BETTER_AUTH_URL=http://localhost:3000

# AI Configuration (Opsional - dapat juga diatur langsung via UI Settings)
AI_DEFAULT_PROVIDER=gateway
AI_GATEWAY_URL=http://localhost:20128/v1
AI_DEFAULT_MODEL=llama-3.3-70b-versatile
```

### 4. Migrasi Database & Menjalankan Server
```bash
# Push schema ke database
bun run db:push

# Jalankan development server
bun dev
```

Aplikasi dapat diakses di `http://localhost:3000`.

---

## 📁 Struktur Direktori

```text
├── app/
│   ├── assets/css/         # Tailwind CSS v4 style definitions
│   ├── components/         # Komponen UI (Habit cards, modals, heatmap)
│   ├── composables/        # State reaktif & theme logic
│   ├── layouts/            # Layout dashboard, auth, dan default
│   ├── pages/              # Nuxt file-based pages
│   └── utils/              # Web Audio synthesizer (sound.ts)
│
├── server/
│   ├── api/
│   │   ├── agent/          # Endpoint telemetry Hermes
│   │   ├── ai/             # Multi-model AI routes & settings
│   │   ├── auth/           # Better Auth routes
│   │   ├── habits/         # Habit & task CRUD, completions
│   │   └── integrations/   # Inbound & outbound n8n handlers
│   ├── db/                 # Drizzle schema & PostgreSQL client
│   └── utils/              # Core AI engine & event dispatcher
│
├── docs/                   # Spesifikasi teknis, arsitektur, dan PRD
├── public/                 # Static assets & banner
└── nuxt.config.ts          # Nuxt configuration
```

---

## 📄 Lisensi

Proyek ini berlisensi [MIT](LICENSE).
