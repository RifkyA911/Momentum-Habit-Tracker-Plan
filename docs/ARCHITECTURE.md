# System Architecture

Momentum dibangun menggunakan arsitektur **Modern Full-Stack Nuxt 4** yang menggabungkan antarmuka reaktif tingkat tinggi, serverless backend API (Nitro), orkestrasi multi-model AI, serta integrasi automasi pihak ketiga.

---

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Client["Frontend Client (Browser / PWA)"]
        UI["Nuxt UI v4 & Tailwind CSS v4"]
        OptUI["Optimistic UI Engine"]
        Audio["Sound Effects / Haptic Feedback"]
        Theme["Dynamic Theme Store (18 Palettes)"]
    end

    subgraph Server["Nuxt Nitro Server (H3)"]
        APIHabits["/api/habits (CRUD, Tasks, Stats)"]
        APIAI["/api/ai/* (Multi-Model Gateway)"]
        APIN8N["/api/integrations/n8n (Inbound Webhook)"]
        APIAgent["/api/agent/habits (Hermes Telemetry)"]
        AuthService["Better Auth Engine"]
        EventBus["Outbound Event Dispatcher (server/utils/events.ts)"]
    end

    subgraph Persistence["Database & Storage"]
        Drizzle["Drizzle ORM"]
        Postgres[("PostgreSQL Database")]
    end

    subgraph AIEngine["AI Subsystem & Orchestration"]
        Router9["9Router Gateway (http://localhost:20128/v1)"]
        Providers["Gemini | Claude | GPT | DeepSeek | Groq | Ollama"]
        Hermes["Nous Research Hermes Agent"]
    end

    subgraph Automation["External Workflow"]
        N8N["n8n Automation Engine (WhatsApp/Telegram/Slack)"]
    end

    Client -->|HTTP / Better Auth Session| Server
    OptUI -->|Instant DOM Mutation| UI
    OptUI -->|Async Sync| APIHabits
    Audio -.->|Trigger Audio Buffer| UI

    APIHabits --> Drizzle
    AuthService --> Drizzle
    Drizzle --> Postgres

    APIHabits -.->|Task Events| EventBus
    EventBus -->|Webhook POST (X-Momentum-Secret)| N8N
    N8N -->|Inbound Actions| APIN8N
    APIN8N --> Drizzle

    APIAI --> Router9
    Router9 -.->|Fallback Failover| Providers
    APIAgent <-->|Telemetry & Insights| Hermes
```

---

## 2. Frontend Layer (Vue 3 & Nuxt 4)

- **Framework**: Nuxt 4 (`^4.4.6`) dengan Vue 3.5 Composition API dan script setup.
- **Komponen UI**: **Nuxt UI v4** (`@nuxt/ui: ^4.8.0`) yang menggunakan semantic token (`primary`, `neutral`, `error`, `success`, `info`, `warning`).
- **Styling**: Tailwind CSS v4 (`^4.3.0`) dengan konfigurasi tema dinamis (18 pilihan warna primer dengan CSS variable injection `--color-primary-*`).
- **Feedback & Haptics**: Modul `sound.ts` menyediakan Web Audio synthesizer procedural (`tick`, `complete`, `streak`, `undo`) tanpa memerlukan aset audio eksternal yang berat.
- **Optimistic UI**: Ketika pengguna mencentang task, state lokal dan DOM segera diperbarui dalam 0ms, audio terpicu, dan request network dikirim di latar belakang secara asynchronous. Jika jaringan gagal, status di-revert dan peringatan error ditampilkan.

---

## 3. Server Layer (Nitro / H3)

- **Type-Safety**: Semua request dan response divalidasi dan di-typecheck menggunakan TypeScript strict mode.
- **Autentikasi Terpadu**: Menggunakan **Better Auth** dengan plugin Drizzle ORM untuk manajemen sesi berbasis cookie yang aman (CSRF protection, HTTP-only cookie, Google OAuth, Email/Password credential).
- **Outbound Event Dispatcher**: [`server/utils/events.ts`](file:///D:/Works/Project/Nuxt.JS/momentum_habit_tracker_plan/server/utils/events.ts) mengirimkan event aktivitas ke n8n secara non-blocking (*fire-and-forget* dengan error capture).

---

## 4. Multi-Model AI Layer

- **Universal Engine (`server/utils/ai.ts`)**: Abstraksi terpusat untuk memproses inferensi AI dari berbagai protokol:
  - Protokol OpenAI-compatible (digunakan oleh 9Router, Google Gemini `/v1beta/openai`, DeepSeek, Groq, OpenRouter, dan Ollama).
  - Protokol Anthropic Claude native (`/v1/messages`).
- **Resilient Fallback**: Mekanisme failover berjenjang menjamin aplikasi tetap beroperasi normal meskipun salah satu provider utama mengalami limit kuota atau gangguan jaringan.

---

## 5. Integrasi Eksternal (n8n & Hermes Agent)

1. **n8n Workflow Engine**:
   - Mendengarkan event dari Momentum untuk mengirimkan notifikasi ke aplikasi chat (WhatsApp / Telegram).
   - Mengirim perintah balik ke Momentum (misalnya user membalas *"tugas baca buku sudah beres"* di WhatsApp, n8n memanggil endpoint Momentum untuk mencentang task).
2. **Nous Research Hermes Agent**:
   - Membaca telemetry dari `/api/agent/habits` untuk mempelajari ritme biologis dan psikologis pengguna.
   - Memberikan dorongan berbasis Cognitive Behavioral Therapy (CBT) saat mendeteksi risiko penurunan konsistensi.
