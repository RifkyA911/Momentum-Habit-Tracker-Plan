# Universal AI Architecture Guide: Momentum Habit Tracker

Momentum kini telah beralih dari ketergantungan kaku pada satu vendor tunggal (Groq SDK) ke arsitektur **Universal Multi-Provider AI Engine** yang tangguh, terukur, dan mendukung **9Router**, **Google Gemini**, **OpenAI GPT**, **Anthropic Claude**, **DeepSeek**, **Groq**, **OpenRouter**, dan **Ollama (Local)** dengan sistem **Failover & Automatic Fallback**.

---

## 1. Arsitektur AI Engine

Arsitektur baru diimplementasikan di [`server/utils/ai.ts`](file:///D:/Works/Project/Nuxt.JS/momentum_habit_tracker_plan/server/utils/ai.ts) dengan prinsip:
1. **OpenAI-Compatible Abstraction**: Sebagian besar AI gateway modern (9Router, OpenRouter, Groq, DeepSeek, Ollama, dan endpoint OpenAI Gemini) menggunakan standar `/v1/chat/completions`.
2. **Native Anthropic Adapter**: Menyediakan adapter khusus untuk Anthropic Claude Messages API (`/v1/messages`) dengan translasi system prompt dan pesan otomatis.
3. **Multi-Tier Failover Cascade**: Jika provider utama (misal: 9Router atau Claude) mengalami timeout, limit kuota (HTTP 429), atau jaringan offline, engine akan otomatis beralih ke provider cadangan (Gemini / OpenAI / Groq / Ollama) tanpa menggagalkan permintaan pengguna.
4. **Structured Output Sanitizer**: Fungsi `extractJSONFromAIResponse` otomatis membersihkan pembungkus markdown codeblock (````json ... ````) dan memvalidasi JSON.

```
                           [Frontend Nuxt 4 Client]
                                      │
            ┌─────────────────────────┴────────────────────────┐
            ▼                                                  ▼
   /api/ai/generate-habit                            /api/ai/reflection
   /api/ai/daily-tip                                 /api/ai/analyze-week
            │                                                  │
            └─────────────────────────┬────────────────────────┘
                                      ▼
                      [server/utils/ai.ts: executeAICompletion]
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           │                                                     │
    (Priority 1: AI Gateway)                            (Priority 2: Fallbacks)
           ▼                                                     ▼
    [9Router Gateway] ──(fail/429)──► [Gemini] ──(fail)──► [DeepSeek] ──(fail)──► [Groq/Local]
 (http://localhost:20128/v1)        (2.0 Flash)          (V3 / R1)                (Llama 3.3)
```

---

## 2. Model & Provider yang Didukung

| Provider | Model Rekomendasi | Tipe Koneksi | Catatan Khusus |
| :--- | :--- | :--- | :--- |
| **9Router** | `llama-3.3-70b-versatile`, `claude-3-7-sonnet`, `deepseek-chat` | OpenAI-compatible (`http://localhost:20128/v1`) | Smart local/VPS gateway, RTK token compression, multi-tier balancer. |
| **Google Gemini** | `gemini-2.0-flash`, `gemini-1.5-pro` | OpenAI-compatible (`https://generativelanguage.googleapis.com/v1beta/openai`) | Sangat cepat, kuota melimpah, biaya rendah. |
| **OpenAI** | `gpt-4o-mini`, `gpt-4o`, `o3-mini` | OpenAI-compatible (`https://api.openai.com/v1`) | Standar industri, reasoning kuat. |
| **Anthropic** | `claude-3-7-sonnet-20250219`, `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022` | Anthropic Messages API (`https://api.anthropic.com/v1`) | Nuansa bahasa dan empati refleksi perilaku terbaik. |
| **DeepSeek** | `deepseek-chat` (DeepSeek-V3), `deepseek-reasoner` (DeepSeek-R1) | OpenAI-compatible (`https://api.deepseek.com`) | Sangat hemat biaya dan performa penalaran luar biasa. |
| **Groq** | `llama-3.3-70b-versatile`, `llama-3.1-8b-instant` | OpenAI-compatible (`https://api.groq.com/openai/v1`) | Latensi inferensi tercepat (LPU ultra-fast). |
| **OpenRouter** | `meta-llama/llama-3.3-70b-instruct`, dll | OpenAI-compatible (`https://openrouter.ai/api/v1`) | Satu kunci API untuk akses ratusan model open-source & komersial. |
| **Ollama** | `llama3.2`, `mistral`, `qwen2.5` | OpenAI-compatible (`http://localhost:11434/v1`) | 100% lokal, offline, tanpa biaya API. |

---

## 3. Konfigurasi Environment (`.env`)

Tambahkan provider yang ingin Anda gunakan ke file `.env`:

```env
# ==============================================================================
# AI GATEWAY & SMART ROUTER (9Router Support)
# ==============================================================================
# Port default 9Router lokal biasanya http://localhost:20128/v1
AI_GATEWAY_URL="http://localhost:20128/v1"
AI_GATEWAY_KEY="sk-9router-local"
AI_DEFAULT_PROVIDER="9router"
AI_DEFAULT_MODEL="llama-3.3-70b-versatile"

# ==============================================================================
# DIRECT AI PROVIDERS (Isi salah satu atau semuanya untuk fallback otomatis)
# ==============================================================================
# Google Gemini (https://aistudio.google.com/app/apikey)
GEMINI_API_KEY="AIzaSy..."

# OpenAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY="sk-proj-..."

# Anthropic Claude (https://console.anthropic.com/settings/keys)
ANTHROPIC_API_KEY="sk-ant-..."

# DeepSeek (https://platform.deepseek.com/api_keys)
DEEPSEEK_API_KEY="sk-..."

# Groq (https://console.groq.com/keys)
GROQ_API_KEY="gsk_..."

# OpenRouter (https://openrouter.ai/keys)
OPENROUTER_API_KEY="sk-or-v1-..."

# Ollama Local (Opsional)
OLLAMA_BASE_URL="http://localhost:11434/v1"
```

---

## 4. Cara Menghubungkan ke 9Router

1. **Jalankan 9Router** di komputer lokal atau VPS Anda:
   ```bash
   # Contoh menjalankan 9Router secara lokal
   npx 9router start
   ```
2. Pastikan 9Router berjalan di port `20128` (atau port pilihan Anda).
3. Di file `.env` Momentum:
   ```env
   AI_GATEWAY_URL="http://localhost:20128/v1"
   AI_DEFAULT_PROVIDER="9router"
   ```
4. Momentum akan langsung merutekan semua prompt pembuatan habit, coaching harian, dan analisis mingguan melalui 9Router. Jika 9Router dimatikan, sistem **tidak akan error**; engine otomatis melakukan fallback ke kunci API Gemini/Groq/OpenAI yang tersedia di `.env`.

---

## 5. Daftar Endpoint AI Baru

- **`POST /api/ai/generate-habit`**:
  - Request: `{ prompt: string, provider?: string, model?: string }`
  - Response: `{ title, icon, color, description, tasks: string[], _meta: { provider, model } }`
- **`POST /api/ai/reflection`**:
  - Request: `{ habitData: { totalHabits, totalCompletions, habitStats, timePatterns, dayPatterns }, provider?: string }`
  - Response: `{ insight: string, _meta: { provider, model } }`
- **`POST /api/ai/daily-tip`**:
  - Request: `{ completedCount: number }`
  - Response: `{ tip: string, _meta: { provider, model } }`
- **`POST /api/ai/analyze-week`**:
  - Request: `{ habitsSummary: any[], weekStats: any }`
  - Response: `{ title: string, description: string, _meta: { provider, model } }`
- **`POST /api/ai/chat`**:
  - Request: `{ message: string }`
  - Response: `{ reply: string, _meta: { provider, model } }`
- **`GET /api/ai/providers`**:
  - Response: Daftar seluruh provider yang terkonfigurasi dan status aktifnya.
