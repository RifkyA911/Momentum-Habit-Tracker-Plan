# Database Schema (PostgreSQL + Drizzle ORM)

## 1. Overview
Database dirancang sesederhana mungkin namun mampu melayani *query* untuk Heatmap dengan efisien. 

## 2. Table Definitions

### `users`
Menyimpan data pengguna dan profil.
- `id` (UUID, Primary Key)
- `name` (String)
- `email` (String, Unique)
- `avatar_url` (String)
- `created_at` (Timestamp)

### `habits`
Menyimpan definisi habit yang dibuat user.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> users.id)
- `title` (String) - Contoh: "Membaca Buku"
- `color` (String) - Untuk visualisasi UI (e.g. "#10B981")
- `icon` (String) - Iconify ID (e.g. "lucide:book")
- `frequency` (Enum/String) - 'DAILY', 'WEEKLY'
- `created_at` (Timestamp)
- `deleted_at` (Timestamp, Nullable) - Soft delete agar log masa lalu tidak hilang.

### `habit_logs`
*Core table* untuk mencatat progres check-in (Bahan utama Heatmap).
- `id` (UUID, Primary Key)
- `habit_id` (UUID, Foreign Key -> habits.id)
- `completed_date` (Date) - Tanggal log (Format: YYYY-MM-DD)
- `created_at` (Timestamp)

*Index krusial*: `Composite Index (habit_id, completed_date)` (Unique) untuk mencegah user check-in dua kali di habit yang sama di hari yang sama.

### `streaks` (Opsional / Computed View)
Untuk performa, streak bisa dihitung secara *on-the-fly* jika data sedikit. Jika ingin di-cache:
- `id` (UUID)
- `habit_id` (UUID)
- `current_streak` (Integer)
- `longest_streak` (Integer)
- `last_completed_date` (Date)

## 3. Drizzle Schema Example (`server/db/schema.ts`)
```typescript
import { pgTable, uuid, text, timestamp, date, uniqueIndex } from 'drizzle-orm/pg-core';

export const habits = pgTable('habits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  color: text('color').default('#10B981'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const habitLogs = pgTable('habit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  habitId: uuid('habit_id').references(() => habits.id),
  completedDate: date('completed_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    unq: uniqueIndex('unique_log_per_day').on(table.habitId, table.completedDate),
  };
});
```
