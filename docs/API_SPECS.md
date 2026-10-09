# API Specifications (Nuxt 4 / Nitro / H3)

Dokumentasi lengkap seluruh endpoint REST API di Momentum. Seluruh endpoint berada di bawah prefix `/api/`.

---

## 1. Authentication & Profil Pengguna

Autentikasi ditangani oleh engine **Better Auth**.

| Endpoint | Method | Deskripsi |
|---|---|---|
| `/api/auth/sign-in/email` | `POST` | Login dengan email dan kata sandi |
| `/api/auth/sign-up/email` | `POST` | Pendaftaran akun baru |
| `/api/auth/sign-in/social` | `POST` | Login pihak ketiga (Google OAuth) |
| `/api/auth/get-session` | `GET` | Membaca sesi aktif pengguna saat ini |
| `/api/auth/sign-out` | `POST` | Logout dan menghapus token sesi |
| `/api/auth/forgot-password` | `POST` | Mengirim instruksi & token reset password |
| `/api/auth/verify-reset-token`| `POST` | Memvalidasi token reset kata sandi |
| `/api/auth/reset-password` | `POST` | Mengubah kata sandi pengguna dengan token valid |

---

## 2. Manajemen Habit & Subtask

### `GET /api/habits/with-data`
Mengambil seluruh kategori habit milik pengguna beserta subtask dan rekam jejak penyelesaiannya (*completions*).
- **Headers:** Sesi cookie aktif
- **Response (200 OK):**
```json
{
  "habits": [
    {
      "id": "habit_uuid",
      "title": "Morning Routine",
      "icon": "i-lucide-sun",
      "color": "#f59e0b",
      "description": "Rutinitas pagi hari",
      "orderIndex": 0,
      "tasks": [
        {
          "id": "task_uuid_1",
          "habitId": "habit_uuid",
          "text": "Minum 500ml air",
          "orderIndex": 0
        }
      ]
    }
  ],
  "completionsByTask": {
    "task_uuid_1": [
      {
        "id": "comp_uuid",
        "taskId": "task_uuid_1",
        "date": "2026-10-10",
        "completedAt": "2026-10-10T06:30:00.000Z"
      }
    ]
  }
}
```

### `POST /api/habits`
Membuat kategori habit baru beserta daftar awal subtask.
- **Request Body:**
```json
{
  "title": "Deep Work Coding",
  "icon": "i-lucide-code",
  "color": "#6366f1",
  "description": "Fokus ngoding tanpa distraksi",
  "tasks": ["Push commit ke git", "Review PR"]
}
```

### `PUT /api/habits/:id`
Mengubah nama, ikon, warna, atau deskripsi habit.

### `DELETE /api/habits/:id`
Menghapus habit secara permanen beserta seluruh relasi subtask dan log penyelesaiannya (`cascade`).

### `PATCH /api/habits/reorder`
Mengubah urutan tampilan habit (drag and drop).
- **Request Body:**
```json
{
  "orderedIds": ["habit_id_2", "habit_id_1"]
}
```

---

## 3. Subtask & Check-in Harian

### `POST /api/habits/:id/tasks`
Menambahkan subtask baru ke dalam habit yang sudah ada.
- **Request Body:**
```json
{
  "text": "Stretching 5 menit"
}
```

### `PATCH /api/habits/tasks/:taskId`
Melakukan check-in (toggle selesai / batal) pada tanggal tertentu. Mendukung **Optimistic UI**.
- **Request Body:**
```json
{
  "completed": true,
  "date": "2026-10-10"
}
```
*Catatan: Endpoint ini secara otomatis memicu outbound event ke webhook n8n jika dikonfigurasi.*

### `PUT /api/habits/tasks/:taskId`
Mengedit teks judul subtask.
- **Request Body:**
```json
{
  "text": "Stretching 10 menit"
}
```

### `DELETE /api/habits/tasks/:taskId`
Menghapus subtask tertentu.

### `PATCH /api/habits/tasks/reorder`
Mengubah urutan subtask di dalam satu habit.

---

## 4. Statistik & Heatmap

### `GET /api/stats`
Mengambil data agregasi untuk visualisasi GitHub Heatmap, total habit aktif, tingkat penyelesaian harian, dan streak.
- **Response (200 OK):**
```json
{
  "summary": {
    "totalHabits": 4,
    "activeStreak": 14,
    "bestStreak": 28,
    "todayCompletionRate": 75
  },
  "heatmap": {
    "2026-10-09": 5,
    "2026-10-10": 4
  }
}
```

---

## 5. Universal AI Engine Endpoints

Semua endpoint AI mendukung opsional query atau body `provider` dan `model` untuk menimpa default sistem.

### `GET /api/ai/providers`
Mengecek daftar provider AI yang tersedia di server beserta status ketersediaan API key.
- **Response (200 OK):**
```json
{
  "defaultProvider": "gateway",
  "defaultModel": "gpt-4o-mini",
  "providers": [
    { "id": "gateway", "name": "9Router Gateway", "configured": true },
    { "id": "gemini", "name": "Google Gemini", "configured": true },
    { "id": "claude", "name": "Anthropic Claude", "configured": true },
    { "id": "deepseek", "name": "DeepSeek API", "configured": true }
  ]
}
```

### `POST /api/ai/generate-habit`
Membuat habit otomatis beserta 3–5 subtask realistis dari ide teks singkat.
- **Request Body:**
```json
{
  "prompt": "Belajar bahasa Jepang untuk JLPT N5",
  "provider": "gemini"
}
```
- **Response (200 OK):**
```json
{
  "title": "Belajar Bahasa Jepang N5",
  "icon": "i-lucide-book-open",
  "color": "#ec4899",
  "description": "Rutinitas latihan Hiragana, Katakana, dan Kanji dasar",
  "tasks": [
    "Hafalkan 5 Kanji baru",
    "Latihan listening 15 menit",
    "Review flashcard Anki"
  ]
}
```

### `POST /api/ai/analyze-week`
Menganalisis performa 7 hari terakhir secara kontekstual berbasis psikologi perilaku.
- **Request Body:**
```json
{
  "period": "7d",
  "habitsSummary": "Olahraga: 5/7 hari, Baca Buku: 7/7 hari, Meditasi: 2/7 hari"
}
```

### `POST /api/ai/daily-tip`
Memberikan saran ringkas dan dorongan motivasi harian.
- **Request Body:** `{}` (opsional context)

### `POST /api/ai/chat`
Percakapan interaktif dengan asisten pelatih kebiasaan.
- **Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Saya sering malas olahraga saat sore hari, solusinya apa ya?" }
  ]
}
```

---

## 6. Automasi n8n & Telemetry Agen Hermes

### `POST /api/integrations/n8n`
Inbound webhook untuk integrasi bot eksternal (WhatsApp, Telegram, Apple Shortcuts) via n8n.
- **Headers:** `X-Momentum-Secret: <N8N_WEBHOOK_SECRET>`
- **Actions:**
  - `get_today_summary`: Membaca ringkasan task user hari ini.
  - `complete_task`: Mencari dan mencentang task berdasarkan ID atau pencarian judul fuzzy.
  - `create_habit`: Membuat habit baru dari percakapan bot.

### `GET /api/agent/habits`
Telemetry endpoint khusus untuk agen otonom **Nous Research Hermes**.
- **Headers:** `Authorization: Bearer <HERMES_API_KEY>`
- **Response (200 OK):**
```json
{
  "agent": "Hermes-Cognitive-Coach",
  "telemetry": {
    "totalHabits": 5,
    "completionRate7d": 64.2,
    "dropOffDay": "Wednesday",
    "productiveTimeOfDay": "morning",
    "burnoutRisk": "low"
  },
  "coachingDirective": "User tends to drop consistency on Wednesday..."
}
```
