# Product Requirements Document (PRD)

## 1. Product Overview
**Momentum** adalah AI-powered Habit Tracker (Micro SaaS) yang berfokus pada "dopamine-driven UX" dan *insights* perilaku menggunakan AI. Tidak seperti habit tracker biasa, Momentum dirancang untuk memberikan visualisasi *rewarding* (seperti heatmap GitHub) dan interaksi super cepat (*Optimistic UI*).

## 2. Target Audience
- Mahasiswa & Pelajar
- Software Developers (menyukai UI ala GitHub/Terminal)
- Productivity Enthusiasts
- Self-improvement Audience

## 3. Core Loop & User Journey
1. **Onboarding**: User mendaftar, ditanya tujuan utama (misal: "Ingin lebih sehat", "Ingin jago coding").
2. **Habit Creation**: User membuat habit dengan target harian/mingguan.
3. **Daily Check-in**: User menekan tombol "Selesai" (langsung merespon instan / Optimistic UI).
4. **Visual Reward**: Heatmap menyala (warna bertambah pekat), *streak* bertambah.
5. **AI Reflection (Weekly)**: AI (Groq) menganalisis pola bolong-bolong dan memberi saran yang disesuaikan secara personal.

## 4. Epics & User Stories (MVP Scope)

### Epic 1: Authentication & User Profile
- **US 1.1**: Sebagai user, saya bisa login menggunakan GitHub atau Google (OAuth) agar cepat.
- **US 1.2**: Sebagai user, saya bisa melihat profil saya dan total *streak* harian saya.

### Epic 2: Habit Management (CRUD)
- **US 2.1**: Sebagai user, saya bisa membuat habit baru (Nama, Deskripsi, Ikon, Frekuensi).
- **US 2.2**: Sebagai user, saya bisa mengedit atau menghapus habit yang salah.
- **US 2.3**: Sebagai user, saya bisa melihat daftar habit harian yang harus saya selesaikan hari ini.

### Epic 3: Check-in & Visualization
- **US 3.1**: Sebagai user, saya bisa menekan *checkbox* habit, dan UI langsung terupdate seketika (Optimistic UI) tanpa *loading spinner*.
- **US 3.2**: Sebagai user, saya bisa melihat *Heatmap* (seperti kontribusi GitHub) untuk melihat konsistensi saya selama 1 tahun terakhir.

### Epic 4: AI Consistency Insights
- **US 4.1**: Sebagai user, ketika saya menekan tombol "Analyze my Week", AI membaca log saya minggu ini dan memberikan 1 paragraf evaluasi (pujian jika konsisten, atau saran perbaikan jika banyak bolong).

## 5. Out of Scope (Untuk V2)
- Offline-first Sync Engine (CRDT)
- Social / Leaderboard
- Mobile Native App (React Native/Flutter) - MVP fokus ke Web Responsive PWA.
