<div align="center">

# 🚀 Momentum

### *Build momentum, not motivation*

**AI-Powered Habit Tracker** dengan Optimistic UI, GitHub-Style Heatmap, dan Behavioral Insights

[![Nuxt](https://img.shields.io/badge/Nuxt-4.4.6-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[🚀 Demo](#) · [📖 Dokumentasi](./docs) · [🐛 Report Bug](https://github.com/yourusername/momentum/issues) · [✨ Request Feature](https://github.com/yourusername/momentum/issues)

<img src="https://ui.nuxt.com/assets/templates/nuxt/starter-dark.png" alt="Momentum Preview" width="800px">

</div>

---

## 📖 Tentang Proyek

**Momentum** adalah aplikasi habit tracker modern yang berfokus pada:

- 🎯 **Optimistic UI** - Feedback instan, tanpa loading spinner
- 📊 **GitHub-Style Heatmap** - Visualisasi konsistensi 365 hari
- 🤖 **AI Insights** - Analisis pola perilaku oleh Groq (LLaMA 3)
- 🔥 **Streak Tracking** - Jangan putus rantai konsistensi
- 🔐 **Better Auth** - OAuth Google & Email/Password

### 💡 Mengapa Momentum Berbeda?

| Fitur | Momentum | Habit Tracker Lain |
|-------|----------|-------------------|
| **UI Response** | ⚡ Instant (Optimistic) | 🐢 Loading spinner |
| **Visualization** | 📊 GitHub-style Heatmap | 📅 Calendar biasa |
| **AI Insights** | 🤖 Behavioral analysis | ❌ Manual tracking |
| **UX Philosophy** | 🧠 Dopamine-driven | 📋 Checklist boring |

---

## 🛠️ Tech Stack

### Frontend
![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?logo=nuxt.js&logoColor=white) **Nuxt 4** - Vue 3 Full-Stack Framework  
![Vue](https://img.shields.io/badge/Vue-4FC08D?logo=vue.js&logoColor=white) **Vue 3** - Progressive JavaScript Framework  
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) **TypeScript** - Type Safety  
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white) **TailwindCSS v4** - Utility-First CSS  
![Nuxt UI](https://img.shields.io/badge/Nuxt_UI-00DC82?logo=nuxt.js&logoColor=white) **Nuxt UI** - Component Library  

### Backend & Database
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white) **PostgreSQL** (Supabase)  
![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?logo=drizzle&logoColor=black) **Drizzle ORM** - TypeScript ORM  
![Better Auth](https://img.shields.io/badge/Better_Auth-FF6B6B) **Better Auth** - Modern Auth  

### AI & Cloud
![Groq](https://img.shields.io/badge/Groq-FF6B35?logo=groq&logoColor=white) **Groq** - LLaMA 3 API  
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white) **Vercel** - Deployment  

---

## 🚀 Quick Start

### 📋 Prerequisites

![Node](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white) **Node.js 22+**  
![pnpm](https://img.shields.io/badge/pnpm-11+-F69220?logo=pnpm&logoColor=white) **pnpm 11+**  
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-4169E1?logo=postgresql&logoColor=white) **PostgreSQL** (Supabase recommended)  
![Groq API](https://img.shields.io/badge/Groq_API-Optional-FF6B35) **Groq API Key** (optional)  

### ⚡ Installation

```bash
# 1️⃣ Clone repository
git clone https://github.com/yourusername/momentum.git
cd momentum

# 2️⃣ Install dependencies
pnpm install

# 3️⃣ Setup environment variables
cp .env.example .env
```

### 🔧 Environment Variables

Buat file `.env` dengan konfigurasi berikut:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Better Auth (minimal 32 karakter)
BETTER_AUTH_SECRET=generate_with_openssl_rand_base64_32
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Groq AI (optional untuk AI insights)
GROQ_API_KEY=your_groq_api_key
```

<details>
<summary>🔑 Cara Mendapatkan Environment Variables</summary>

### DATABASE_URL (Supabase)
1. Buat akun di [Supabase](https://supabase.com)
2. Buat project baru
3. Go to Settings > Database
4. Copy connection string (use URI format)

### BETTER_AUTH_SECRET
```bash
openssl rand -base64 32
```

### Google OAuth
1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### GROQ_API_KEY
1. Daftar di [Groq](https://console.groq.com)
2. Buat API key di dashboard

</details>

### 🗃️ Database Setup

```bash
# Generate migrations
pnpm run db:generate

# Push schema to database
pnpm run db:push

# (Optional) Open Drizzle Studio
pnpm run db:studio
```

### 🎯 Run Development Server

```bash
# Start dev server
pnpm dev
```

Buka **http://localhost:3000** di browser 🎉

---

## 📁 Project Structure

```
momentum/
├── 📂 app/                    # Frontend Application
│   ├── 📂 components/         # Vue Components
│   │   ├── AppLogo.vue
│   │   ├── NavbarAuth.vue
│   │   └── ThemePicker.vue
│   ├── 📂 pages/              # Route Pages
│   │   ├── index.vue         # Landing page
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── login.vue
│   │   └── register.vue
│   ├── 📂 layouts/            # Layout Templates
│   │   ├── default.vue
│   │   ├── auth.vue
│   │   └── dashboard.vue
│   ├── 📂 middleware/         # Route Guards
│   │   └── auth.ts
│   └── 📂 assets/             # Static Assets
│       └── css/main.css
│
├── 📂 server/                 # Backend API
│   ├── 📂 api/                # API Endpoints
│   │   ├── auth/[...all].ts  # Better Auth routes
│   │   ├── groq.post.ts      # AI insights endpoint
│   │   └── health.ts         # Health check
│   ├── 📂 db/                 # Database Layer
│   │   └── schema.ts         # Drizzle schema
│   └── 📂 utils/              # Server Utilities
│       ├── auth.ts
│       └── db.ts
│
├── 📂 docs/                    # Documentation
│   ├── PRD.md                # Product Requirements
│   ├── ARCHITECTURE.md       # System Design
│   ├── DATABASE.md           # DB Schema
│   ├── API_SPECS.md          # API Documentation
│   ├── AI_STRATEGY.md        # AI Integration
│   └── UI_UX.md              # Design Guidelines
│
├── 📄 package.json
├── 📄 nuxt.config.ts
├── 📄 drizzle.config.ts
└── 📄 README.md
```

---

## 🗄️ Database Schema

### Core Tables

```typescript
// Users Table
users {
  id: uuid
  email: string
  name: string
  created_at: timestamp
}

// Habits Table
habits {
  id: uuid
  user_id: uuid (FK)
  title: string
  description: string
  color: string
  icon: string
  frequency: 'daily' | 'weekly'
  created_at: timestamp
}

// Habit Logs Table (untuk heatmap)
habit_logs {
  id: uuid
  habit_id: uuid (FK)
  user_id: uuid (FK)
  completed_at: date
  created_at: timestamp
}
```

Diagram lengkap: [DATABASE.md](./docs/DATABASE.md)

---

## 🌐 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/sign-up` | Register new user |
| `POST` | `/api/auth/sign-in` | Login user |
| `GET` | `/api/auth/session` | Get current session |
| `POST` | `/api/auth/sign-out` | Logout user |

### ✅ Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/habits` | Get all user habits |
| `POST` | `/api/habits` | Create new habit |
| `PUT` | `/api/habits/:id` | Update habit |
| `DELETE` | `/api/habits/:id` | Delete habit |

### 📊 Check-ins & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/habits/:id/log` | Log habit completion |
| `DELETE` | `/api/habits/:id/log` | Undo today's check-in |
| `GET` | `/api/habits/heatmap` | Get yearly heatmap data |
| `POST` | `/api/groq` | AI consistency insights |

Dokumentasi lengkap: [API_SPECS.md](./docs/API_SPECS.md)

---

## 🧠 Design Patterns

### ⚡ Optimistic UI Flow

```
User Click → Instant UI Update → State Update → Background API Call
    ↓              ↓                    ↓              ↓
[✓ Checked]  [Loading...]      [Pinia Store]   [Success/Error]
                                                         ↓
                                              [Revert on Error + Toast]
```

### 🤖 AI Insights Pipeline

```
[User: "Analyze my Week"]
        ↓
[Fetch: Last 7 days logs]
        ↓
[Compress: Summary string]
        ↓
[Groq API: Behavioral analysis]
        ↓
[Response: Personalized advice]
```

**Prompt Engineering** detail: [AI_STRATEGY.md](./docs/AI_STRATEGY.md)

---

## 📚 Documentation

| Doc | Description |
|-----|-------------|
| 📋 [PRD.md](./docs/PRD.md) | Product requirements & user stories |
| 🏗️ [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture & design decisions |
| 🗄️ [DATABASE.md](./docs/DATABASE.md) | Database schema & migrations |
| 🔌 [API_SPECS.md](./docs/API_SPECS.md) | REST API documentation |
| 🤖 [AI_STRATEGY.md](./docs/AI_STRATEGY.md) | AI integration & prompt design |
| 🎨 [UI_UX.md](./docs/UI_UX.md) | Design system & UX guidelines |
| 📄 [sdd.md](./docs/sdd.md) | Software design document |

---

## 🚢 Deployment

### Build for Production

```bash
# Build
pnpm build

# Preview locally
pnpm preview
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/momentum)

1. Push ke GitHub
2. Connect repository di Vercel
3. Set environment variables
4. Deploy! 🚀

---

## 🧪 Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm typecheck        # TypeScript type checking

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:push          # Push schema changes
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
```

---

## 🤝 Contributing

Kontribusi sangat diterima! Silakan buat **Pull Request**.

### 🔄 Development Workflow

1. **Fork** repository ini
2. **Clone** fork Anda
3. Buat **branch** fitur (`git checkout -b feature/amazing-feature`)
4. **Commit** perubahan (`git commit -m 'feat: add amazing feature'`)
5. **Push** ke branch (`git push origin feature/amazing-feature`)
6. Buat **Pull Request**

### 📝 Commit Convention

Gunakan [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add AI weekly analysis
fix: resolve heatmap rendering issue
docs: update API documentation
style: format code with prettier
refactor: optimize optimistic UI logic
test: add unit tests for habits API
```

---

## 📝 License

Proyek ini dilisensikan di bawah **MIT License** - lihat file [LICENSE](LICENSE) untuk detail.

---

## 🙏 Acknowledgments

Dibuat dengan:

- ![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?logo=nuxt.js&logoColor=white) [Nuxt](https://nuxt.com)
- 🎨 [Nuxt UI](https://ui.nuxt.com) - Component Library
- ⚡ [Groq](https://groq.com) - AI Inference
- 🔐 [Better Auth](https://better-auth.com) - Authentication
- 🗄️ [Drizzle ORM](https://orm.drizzle.team) - Database Toolkit
- 🎨 [TailwindCSS](https://tailwindcss.com) - Styling

---

## 📞 Contact & Support

- 📧 Email: your.email@example.com
- 🐛 Bug Reports: [GitHub Issues](https://github.com/yourusername/momentum/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/momentum/discussions)

---

<div align="center">

**⭐ Jika proyek ini bermanfaat, berikan star! ⭐**

Dibuat dengan ❤️ oleh [Your Name](https://github.com/yourusername)

[⬆ Kembali ke Atas](#-momentum)

</div>
