<div align="center">

# 🚀 Momentum

### *Build momentum, not motivation*

**AI-Powered Habit Tracker** with Zero-Latency Optimistic UI, GitHub-Style Heatmap, Audio Haptics, and Universal Multi-Model AI Gateway.

[![Nuxt](https://img.shields.io/badge/Nuxt-4.4.6-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Nuxt UI](https://img.shields.io/badge/Nuxt_UI-v4.8-00DC82?logo=nuxt.js&logoColor=white)](https://ui.nuxt.com)
[![9Router](https://img.shields.io/badge/AI_Gateway-9Router-8B5CF6)](./docs/AI_ARCHITECTURE.md)
[![n8n](https://img.shields.io/badge/Automation-n8n-EA4B71?logo=n8n&logoColor=white)](./docs/N8N_AUTOMATION.md)
[![Hermes](https://img.shields.io/badge/Agent-Nous_Hermes-FF6B35)](./docs/HERMES_AGENT.md)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[🚀 Fitur](#-fitur-utama) · [📖 Dokumentasi](./docs) · [🤖 Arsitektur AI](./docs/AI_ARCHITECTURE.md) · [⚡ Automasi n8n](./docs/N8N_AUTOMATION.md) · [🧠 Agen Hermes](./docs/HERMES_AGENT.md)

</div>

---

## 📖 Tentang Momentum

**Momentum** adalah platform pelacak kebiasaan (*Habit Tracker*) modern yang dirancang untuk mengakhiri rasa jenuh dari checklist konvensional. Mengadopsi prinsip **Dopamine-Driven UX**, interaksi instan tanpa loading spinner (*Optimistic UI*), visualisasi 365 hari ala **GitHub Heatmap**, efek audio prosedural, serta ekosistem AI multi-vendor yang cerdas dan tahan banting.

### 💡 Keunggulan Utama Momentum

| Fitur | Momentum | Habit Tracker Konvensional |
|---|---|---|
| **Respon UI** | ⚡ 0ms Instan (Optimistic UI) | 🐢 Loading spinner setiap klik |
| **Visualisasi** | 📊 365-Day GitHub Contribution Heatmap | 📅 Kalender statis biasa |
| **Ekosistem AI** | 🤖 **Universal Gateway** (9Router, Gemini, Claude, GPT, DeepSeek, Groq, Ollama) | ❌ Hanya 1 vendor atau tanpa AI |
| **Ketahanan AI** | 🛡️ *Cascading Failover* otomatis saat limit kuota | 💥 Error 500 saat token habis |
| **Otomatisasi Bot** | 🔁 **n8n Webhooks** (Check-in via WhatsApp/Telegram) | ❌ Terkunci di dalam web |
| **Asisten Kognitif** | 🧠 **Nous Research Hermes Agent** (Deteksi risiko burnout) | ❌ Hanya chatbot generik |
| **Feedback Sensorik**| 🔊 Audio sintetis prosedural Web Audio | 🔇 Tampilan bisu membosankan |
| **Kustomisasi Tema**| 🎨 18 Palet warna dinamis dengan persistensi | ⚙️ Pilihan warna terbatas |

---

## ✨ Fitur Utama

### 1. 🤖 Universal Multi-Model AI Engine
- **9Router Support**: Siap terhubung ke 9Router (`http://localhost:20128/v1`) untuk perutean cerdas dan penghematan token.
- **Dukungan Seluruh Model Populer**:
  - **Google Gemini** (`gemini-2.5-flash`, `gemini-1.5-pro`)
  - **Anthropic Claude** (`claude-3-5-sonnet-latest`, `claude-3-5-haiku-latest`)
  - **OpenAI** (`gpt-4o`, `gpt-4o-mini`)
  - **DeepSeek** (`deepseek-chat`, `deepseek-reasoner`)
  - **Groq Cloud** (`llama-3.3-70b-versatile`, `mixtral-8x7b-32768`)
  - **OpenRouter** & **Ollama Local**
- **Cascading Fallback**: Otomatis beralih ke provider cadangan jika provider utama terkena *rate limit* (HTTP 429) atau error.
- **Magic Create**: Cukup ketik satu ide (misal: *"Belajar Flutter sampai mahir"*), AI akan merancang habit beserta 3–5 subtask mikro terperinci.
- **Weekly Review & Daily Tips**: Evaluasi berkala berbasis psikologi perilaku.

### 2. ⚡ Optimistic UI & Web Audio Haptics
- Perubahan status centang langsung tercermin dalam 0 milidetik.
- Efek suara prosedural Web Audio murni (`tick`, `complete`, `streak`, `undo`) tanpa perlu download file audio besar.

### 3. 🔁 Integrasi Automasi n8n (Two-Way)
- **Outbound Webhooks**: Momentum otomatis mengirim event saat task diselesaikan atau dibuat.
- **Inbound Webhooks**: Memungkinkan bot WhatsApp/Telegram membaca ringkasan harian dan mencentang kebiasaan lewat pesan chat cerdas (fuzzy search).

### 4. 🧠 Agen Otonom Hermes (Nous Research)
- Endpoint telemetry `/api/agent/habits` menyediakan analisis *drop-off day*, kluster waktu produktif, dan level risiko *burnout* untuk bimbingan kognitif proaktif.

### 5. 🎨 Sistem Tema Dinamis
- 18 pilihan palet warna primer dengan injeksi CSS variable otomatis (`50` hingga `950`).
- Dukungan Dark Mode dan Light Mode penuh.
- Persistensi di `localStorage`.

---

## 🛠️ Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com) (`v4.4.6`) + [Vue 3.5](https://vuejs.org)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **UI Components**: [Nuxt UI v4](https://ui.nuxt.com) (`@nuxt/ui: ^4.8.0`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (`^4.3.0`)
- **Database & ORM**: PostgreSQL ([Supabase](https://supabase.com) / [Neon](https://neon.tech)) + [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: [Better Auth](https://better-auth.com) (Session Cookies, Google OAuth, Email/Password)
- **Runtime & Package Manager**: [Bun](https://bun.sh) (`v1.1.27+`)

---

## 🚀 Panduan Memulai Cepat

### 1. Kebutuhan Sistem
- **Bun**: v1.0.0 atau lebih baru (Sangat direkomendasikan)
- **PostgreSQL**: PostgreSQL 14+ (Lokal, Supabase, atau Neon)
- **AI Key (Salah satu atau lebih)**: 9Router, Gemini, Claude, OpenAI, DeepSeek, atau Groq

### 2. Instalasi

```bash
# 1. Clone repository
git clone https://github.com/yourusername/momentum.git
cd momentum

# 2. Pasang dependensi menggunakan Bun
bun install

# 3. Salin konfigurasi environment
cp .env.example .env
```

### 3. Konfigurasi Environment (`.env`)

```env
# Database
DATABASE_URL=postgres://user:password@localhost:5432/momentum

# Better Auth
BETTER_AUTH_SECRET=your_long_random_secret_string_32_chars
BETTER_AUTH_URL=http://localhost:3000

# AI Provider Pilihan (Bisa diarahkan ke 9Router atau langsung)
AI_DEFAULT_PROVIDER=gateway
AI_GATEWAY_URL=http://localhost:20128/v1
AI_GATEWAY_KEY=your_key
AI_DEFAULT_MODEL=gpt-4o-mini

# Kunci API Alternatif (Opsional untuk fitur fallback)
GEMINI_API_KEY=AIzaSy...
DEEPSEEK_API_KEY=sk-...
GROQ_API_KEY=gsk_...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Integrasi Automasi (Opsional)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/momentum-events
N8N_WEBHOOK_SECRET=your_n8n_secret
HERMES_API_KEY=hermes_agent_secret
```

### 4. Setup Database & Jalankan

```bash
# Push skema Drizzle ke PostgreSQL
bun run db:push

# Jalankan server development
bun dev
```

Buka **http://localhost:3000** di browser Anda 🎉

---

## 📁 Struktur Direktori

```text
momentum/
├── 📂 app/                     # Frontend Application (Nuxt 4 / Vue 3.5)
│   ├── 📂 assets/css/         # Tailwind CSS v4 Styles
│   ├── 📂 components/         # Komponen UI Bento-box & Modals
│   ├── 📂 composables/        # useTheme, useSound, dan logic reaktif
│   ├── 📂 layouts/            # default, auth, dan dashboard layout
│   ├── 📂 pages/              # Routing Nuxt (Dashboard, Auth, Demo, History)
│   └── 📂 utils/              # sound.ts (Web Audio synthesizer)
│
├── 📂 server/                  # Backend API (Nitro / H3)
│   ├── 📂 api/                # REST API Endpoints
│   │   ├── 📂 agent/          # Endpoint Telemetry Hermes Agent
│   │   ├── 📂 ai/             # Multi-Model AI Endpoints (Generate, Tip, Review)
│   │   ├── 📂 auth/           # Better Auth routes & reset password
│   │   ├── 📂 habits/         # Habit & Subtask CRUD, Reorder, Completions
│   │   ├── 📂 integrations/   # Inbound n8n Webhook Endpoint
│   │   └── stats.get.ts       # GitHub Heatmap & Aggregated Metrics
│   ├── 📂 db/                 # Drizzle Schema & PostgreSQL Client
│   └── 📂 utils/              # ai.ts (Universal Engine), events.ts (n8n Dispatcher)
│
├── 📂 docs/                    # Dokumentasi Teknis Lengkap
│   ├── 📄 AI_ARCHITECTURE.md  # Panduan Lengkap 9Router & Semua Model AI
│   ├── 📄 N8N_AUTOMATION.md   # Panduan Automasi n8n & WhatsApp Bot
│   ├── 📄 HERMES_AGENT.md     # Panduan Integrasi Agen Otonom Hermes
│   ├── 📄 AI_STRATEGY.md      # Strategi Multi-Model & Fallback
│   ├── 📄 API_SPECS.md        # Spesifikasi Lengkap Endpoint REST API
│   ├── 📄 ARCHITECTURE.md     # Desain Arsitektur Sistem Menyeluruh
│   ├── 📄 DATABASE.md         # Skema Database & Relasi ERD
│   ├── 📄 PRD.md              # Product Requirements Document
│   ├── 📄 sdd.md              # Software Design Document v3
│   └── 📄 UI_UX.md            # Panduan Desain Nuxt UI v4 & Sound FX
│
├── 📄 nuxt.config.ts          # Konfigurasi Nuxt 4 & Runtime Config
├── 📄 drizzle.config.ts       # Konfigurasi Drizzle Kit
└── 📄 package.json
```

---

## 📚 Indeks Dokumentasi

Untuk detail teknis lebih mendalam, silakan baca dokumentasi di folder [`docs/`](./docs):

- [🤖 **Panduan Arsitektur AI & 9Router**](./docs/AI_ARCHITECTURE.md)
- [🔁 **Panduan Automasi Webhook n8n**](./docs/N8N_AUTOMATION.md)
- [🧠 **Panduan Integrasi Hermes Agent**](./docs/HERMES_AGENT.md)
- [🎯 **Strategi AI Multi-Vendor & Failover**](./docs/AI_STRATEGY.md)
- [🔌 **Spesifikasi Lengkap REST API**](./docs/API_SPECS.md)
- [🏗️ **Arsitektur Sistem (System Architecture)**](./docs/ARCHITECTURE.md)
- [🗄️ **Dokumentasi Database & Relasi ERD**](./docs/DATABASE.md)
- [📋 **Product Requirements Document (PRD)**](./docs/PRD.md)
- [📐 **Software Design Document (SDD v3)**](./docs/sdd.md)
- [🎨 **Panduan Desain UI/UX & Web Audio Haptics**](./docs/UI_UX.md)

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.
