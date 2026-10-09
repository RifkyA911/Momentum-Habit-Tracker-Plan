# Panduan Integrasi Hermes Autonomous Agent (Nous Research)

Momentum kini dilengkapi dengan protokol antarmuka agen otonom untuk **Hermes Agent** (framework autonomous agent dari Nous Research). Berbeda dari chatbot konvensional yang stateless, Hermes dirancang untuk beroperasi dengan **persistent memory**, **user modeling**, dan **goal-oriented autonomous action**.

---

## 1. Peran Hermes Agent dalam Momentum

Dalam ekosistem pelacak kebiasaan (habit tracking), kelemahan terbesar pengguna adalah **kemunduran konsistensi (burnout atau friction)** di hari-hari tertentu. Hermes Agent bertindak sebagai pelatih perilaku kognitif (cognitive behavioral coach) yang:
1. **Memantau telemetri berkala**: Menginspeksi jam penyelesaian, hari terlemah, dan drop-off rate 30 hari secara otonom.
2. **Membangun Model Pengguna Jangka Panjang**: Mencatat pola psikologis pengguna (misal: *"User konsisten di pagi hari, namun mengalami resistensi psikologis jika beban task membaca buku lebih dari 20 menit di hari kerja"*).
3. **Intervensi Adaptif**: Menyesuaikan micro-habits sebelum streak pengguna pecah.

---

## 2. Endpoint Telemetri Hermes

Endpoint agen:
`GET /api/agent/habits`

### Header Autentikasi
- `Authorization: Bearer <HERMES_API_KEY>` atau
- `X-Hermes-Key: <HERMES_API_KEY>`

### Konfigurasi `.env`
```env
HERMES_API_KEY="hermes_sec_99182312_momentum"
```

---

## 3. Struktur Respon Telemetri Hermes (`agentProtocol: hermes-v1`)

Contoh respons yang diterima oleh Hermes:

```json
{
  "agentProtocol": "hermes-v1",
  "timestamp": "2026-10-10T12:00:00.000Z",
  "userContext": {
    "userId": "usr_102938",
    "totalActiveHabits": 4,
    "totalCompletions30Days": 68
  },
  "telemetry": {
    "habits": [
      { "id": "h1", "title": "Deep Work 90m", "icon": "⚡", "taskCount": 2 },
      { "id": "h2", "title": "Gym & Stretching", "icon": "🏋️", "taskCount": 3 }
    ],
    "dayOfWeekPatterns": {
      "Sunday": 4,
      "Monday": 14,
      "Tuesday": 16,
      "Wednesday": 15,
      "Thursday": 12,
      "Friday": 7,
      "Saturday": 0
    },
    "timeOfDayPatterns": {
      "morning": 32,
      "afternoon": 24,
      "evening": 12,
      "night": 0
    },
    "behavioralSignals": {
      "weakestDay": "Saturday",
      "weakestDayCompletions": 0,
      "burnoutRisk": "medium"
    }
  }
}
```

---

## 4. Cara Menghubungkan Hermes ke Momentum

Hermes Agent dapat dihubungkan melalui dua metode:

### Metode A: HTTP Tool Calling (Standard REST)
Dalam konfigurasi Hermes tools (`hermes.yaml` atau agent prompt definition), daftarkan tool:

```yaml
tools:
  - name: get_user_habit_telemetry
    description: "Mengambil data telemetri habit user, tren hari terlemah, dan risiko burnout."
    url: "http://localhost:3000/api/agent/habits"
    method: "GET"
    headers:
      Authorization: "Bearer hermes_sec_99182312_momentum"
```

### Metode B: Model Context Protocol (MCP)
Jika Anda menggunakan Hermes MCP Server, Anda dapat membungkus endpoint `/api/agent/habits` ke dalam MCP resource/tool lokal:
- Tool `inspect_habits`: Mengambil data habit untuk analisis kognitif.
- Tool `suggest_habit_refinement`: Memberikan rekomendasi penyesuaian intensitas habit kepada user.

---

## 5. Alur Kerja Evaluasi Hermes Otonom

```
[Hermes Autonomous Scheduler (e.g. Setiap Minggu 20:00)]
                           │
                           ▼
              [Panggil GET /api/agent/habits]
                           │
                           ▼
         [Hermes Menganalisis Behavioral Signals]
 (Contoh: "Deteksi Sabtu bolos total 4 minggu berturut-turut")
                           │
                           ▼
          [Hermes Menyimpan Catatan Memory Jangka Panjang]
                           │
                           ▼
         [Kirim Intervensi Konstruktif ke User]
("Halo! Saya perhatikan hari Sabtu selalu jadi titik gesekan.
 Bagaimana jika di hari Sabtu kita turunkan target dari 3 task menjadi 1 micro-task saja?")
```
