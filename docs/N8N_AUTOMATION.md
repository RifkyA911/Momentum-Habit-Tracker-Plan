# Panduan Integrasi n8n Automation: Momentum Habit Tracker

Momentum kini mendukung integrasi **dua arah (Bi-directional Automation)** dengan platform otomatisasi workflow **n8n**. Ini memungkinkan Anda membangun alur kerja cerdas seperti:
- Pengingat otomatis di Telegram/WhatsApp jika ada habit yang belum selesai pada sore hari.
- Mencatat habit langsung lewat pesan suara (voice memo) atau chat WhatsApp.
- Sinkronisasi otomatis habit yang selesai ke Google Sheets, Notion, atau Apple Health.
- Trigger otomatis smart bulb/notifikasi perayaan saat streak mencapai 7 hari.

---

## 1. Aliran Outbound (Momentum ➔ n8n)

Setiap kali terjadi aksi penting di Momentum, server secara asinkron mengirimkan HTTP POST event ke webhook n8n Anda.

### Konfigurasi `.env`
```env
N8N_WEBHOOK_URL="https://n8n.yourdomain.com/webhook/momentum-events"
N8N_WEBHOOK_SECRET="my_super_secure_n8n_secret_123"
```

### Event Payload yang Dikirim

#### A. `task.completed`
Dikirim ketika pengguna mencentang task habit:
```json
{
  "event": "task.completed",
  "timestamp": "2026-10-10T12:00:00.000Z",
  "userId": "usr_99182371",
  "data": {
    "taskId": "tsk_019238",
    "date": "2026-10-10",
    "completed": true
  }
}
```

#### B. `habit.created`
Dikirim ketika habit baru dibuat (baik secara manual maupun via Magic AI):
```json
{
  "event": "habit.created",
  "timestamp": "2026-10-10T12:00:00.000Z",
  "userId": "usr_99182371",
  "data": {
    "habitId": "hab_102938",
    "title": "Minum Air 2L"
  }
}
```

### Setup di n8n:
1. Buat node **Webhook** di n8n dengan metode `POST`.
2. Pada bagian **Header Auth** atau **Custom Headers**, verifikasi bahwa header `X-Momentum-Secret` sama dengan nilai `N8N_WEBHOOK_SECRET`.
3. Gunakan node **Switch** berdasarkan `{{ $json.body.event }}` untuk membedakan aksi.

---

## 2. Aliran Inbound (n8n ➔ Momentum)

n8n dapat memerintahkan server Momentum untuk membaca status atau mencentang habit melalui endpoint:
`POST /api/integrations/n8n`

### Header Wajib
- `Content-Type: application/json`
- `X-Momentum-Secret: <N8N_WEBHOOK_SECRET>`

---

### Aksi yang Didukung

#### 1. Dapatkan Ringkasan Hari Ini (`get_today_summary`)
Mendapatkan semua habit user dan status penyelesaian tugas hari ini.

**Request:**
```bash
curl -X POST "http://localhost:3000/api/integrations/n8n" \
  -H "Content-Type: application/json" \
  -H "X-Momentum-Secret: my_super_secure_n8n_secret_123" \
  -d '{
    "action": "get_today_summary",
    "userId": "your_user_id"
  }'
```

**Response:**
```json
{
  "date": "2026-10-10",
  "totalHabits": 3,
  "totalTasks": 8,
  "completedTasksToday": 5,
  "habits": [
    {
      "id": "h1",
      "title": "Morning Routine",
      "icon": "☀️",
      "totalTasks": 3,
      "completedTasks": 3,
      "isFullyCompleted": true,
      "tasks": [
        { "id": "t1", "text": "Minum 500ml air", "completed": true },
        { "id": "t2", "text": "Stretching 10 menit", "completed": true }
      ]
    }
  ]
}
```

---

#### 2. Centang Task Selesai (`complete_task`)
Bisa mencentang berdasarkan `taskId` langsung atau pencarian nama task (`taskName`). Ini sangat cocok untuk integrasi bot WhatsApp/Telegram.

**Request contoh menggunakan pencarian nama:**
```bash
curl -X POST "http://localhost:3000/api/integrations/n8n" \
  -H "Content-Type: application/json" \
  -H "X-Momentum-Secret: my_super_secure_n8n_secret_123" \
  -d '{
    "action": "complete_task",
    "userId": "your_user_id",
    "taskName": "Minum 500ml"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Task marked as completed",
  "taskId": "t1",
  "date": "2026-10-10"
}
```

---

#### 3. Buat Habit Baru (`create_habit`)
Membuat habit beserta task-nya secara terprogram dari automasi n8n.

**Request:**
```bash
curl -X POST "http://localhost:3000/api/integrations/n8n" \
  -H "Content-Type: application/json" \
  -H "X-Momentum-Secret: my_super_secure_n8n_secret_123" \
  -d '{
    "action": "create_habit",
    "userId": "your_user_id",
    "title": "Belajar Python",
    "icon": "🐍",
    "color": "#10b981",
    "description": "30 menit coding setiap hari",
    "tasks": [
      "Buka materi kursus",
      "Latihan 1 soal LeetCode",
      "Commit ke GitHub"
    ]
  }'
```

---

## 3. Contoh Arsitektur n8n: Bot WhatsApp Habit

```
[User kirim WA: "Sudah minum air"]
             │
             ▼
      [WhatsApp Trigger] (Baileys / Evolution API)
             │
             ▼
       [AI Agent Node] (Mengidentifikasi intensi user)
             │
             ▼
   [HTTP Request Node: Momentum API]
   POST /api/integrations/n8n
   Body: { "action": "complete_task", "taskName": "minum air" }
             │
             ▼
[Kirim balasan WA: "Mantap! Task 'Minum 500ml air' berhasil dicentang ✅"]
```
