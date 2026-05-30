# API Specifications (Nitro / H3)

Semua endpoint dilayani melalui `server/api/`. Payload menggunakan JSON. Autentikasi ditangani oleh *middleware* dari Better Auth.

## 1. Auth & User Profile

### `GET /api/user/profile`
Mengambil data user yang sedang login beserta skor/streak.
- **Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Rifky",
  "email": "rifky@example.com",
  "total_streaks": 12,
  "join_date": "2024-05-01T00:00:00Z"
}
```

## 2. Habits CRUD

### `GET /api/habits`
Mengambil semua habit milik user beserta status apakah hari ini sudah dikerjakan atau belum.
- **Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "title": "Workout",
    "color": "#10B981",
    "icon": "lucide:dumbbell",
    "is_completed_today": true,
    "current_streak": 5
  }
]
```

### `POST /api/habits`
Membuat habit baru.
- **Body:**
```json
{
  "title": "Membaca Buku",
  "color": "#F59E0B",
  "icon": "lucide:book"
}
```

## 3. Habit Check-in (Logs)

### `POST /api/habits/:id/log`
Mencatat habit selesai pada hari ini. (Dipanggil di belakang layar setelah Optimistic UI).
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged successfully"
}
```

### `DELETE /api/habits/:id/log`
Membatalkan (undo) check-in hari ini.

## 4. AI & Analytics

### `GET /api/habits/heatmap`
Data untuk dirender menjadi GitHub-style contribution graph.
- **Query:** `?year=2024`
- **Response:**
```json
{
  "2024-05-20": 2, 
  "2024-05-21": 0,
  "2024-05-22": 3
}
```
*(Key adalah tanggal, Value adalah jumlah habit yang diselesaikan di tanggal tersebut).*

### `POST /api/ai/insights`
*(Sudah diimplementasikan sebagian di testing Groq)*
Menggenerate AI Insights mingguan berdasarkan log 7 hari ke belakang.
