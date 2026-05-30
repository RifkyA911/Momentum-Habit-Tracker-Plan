<div align="center">

# 🚀 Momentum

### *Build momentum, not motivation*

**AI-Powered Habit Tracker** with Optimistic UI, GitHub-Style Heatmap, and Behavioral Insights

[![Nuxt](https://img.shields.io/badge/Nuxt-4.4.6-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[🚀 Demo](#) · [📖 Documentation](./docs) · [🐛 Report Bug](https://github.com/yourusername/momentum/issues) · [✨ Request Feature](https://github.com/yourusername/momentum/issues)


</div>

---

## 📖 About Project

**Momentum** is a modern habit tracker application focusing on:

- 🎯 **Optimistic UI** - Instant feedback, no loading spinner
- 📊 **GitHub-Style Heatmap** - 365-day consistency visualization
- 🤖 **AI Insights** - Behavioral pattern analysis by Groq (LLaMA 3)
- 🔥 **Streak Tracking** - Don't break the consistency chain
- 🔐 **Better Auth** - Google OAuth & Email/Password
- 🎨 **Custom Theme** - Choose theme color with persistence
- 🚀 **Demo Mode** - Browser-based showcase with sample data
- ⚡ **Animated Loading** - Loading screen with star trail and bouncing icon

### 💡 Why Momentum is Different?

| Feature | Momentum | Other Habit Trackers |
|---------|----------|---------------------|
| **UI Response** | ⚡ Instant (Optimistic) | 🐢 Loading spinner |
| **Visualization** | 📊 GitHub-style Heatmap | 📅 Regular calendar |
| **AI Insights** | 🤖 Behavioral analysis | ❌ Manual tracking |
| **UX Philosophy** | 🧠 Dopamine-driven | 📋 Boring checklist |
| **Theme System** | 🎨 Custom with persistence | ⚙️ Limited |
| **Demo Mode** | 🚀 Showcase sample | ❌ Must register |
| **Loading UX** | ⚡ Animated star trail | 🔄 Regular spinner |

---

## ✨ New Features

### 🚀 Demo Mode
- **Browser-based showcase** with sample data stored in localStorage
- No authentication required to view the demo
- Same layout and features as main dashboard
- Ideal for showcase and UX demonstration

### 🎨 Custom Theme System
- **Dynamic primary color picker** with 18 color options
- **LocalStorage persistence** - color saved in browser
- Automatic CSS variable generation for all shades (50-950)
- Integrated with UnifiedThemePicker component

### 🔌 MCP Utility Integration
- **Model Context Protocol (MCP)** integration for enhanced AI capabilities
- Seamless connection with MCP-compatible tools and services
- Extensible architecture for custom MCP utilities
- Enables advanced AI interactions and data processing

### ⚡ Global Loading Screen
- **Animated star trail background** with 30 colorful dots
- **Bouncing activity icon** as loading indicator
- **Flat design hills** at bottom for visual appeal
- Appears on first app load before theme is ready

### 📝 Footer Component
- **Author attribution** with link to GitHub profile
- **Repository link** for quick access to source code
- **Brand logo** with tagline
- Responsive design for mobile and desktop

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
![MCP](https://img.shields.io/badge/MCP-8B5CF6?logo=model-context-protocol&logoColor=white) **MCP** - Model Context Protocol  
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white) **Vercel** - Deployment  

---

## 🚀 Quick Start

### 📋 Prerequisites

![Node](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white) **Node.js 22+**  
![Bun](https://img.shields.io/badge/Bun-1.0+-FF6B35?logo=bun&logoColor=white) **Bun 1.0+** (primary)  
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-4169E1?logo=postgresql&logoColor=white) **PostgreSQL** (Supabase recommended)  
![Groq API](https://img.shields.io/badge/Groq_API-Optional-FF6B35) **Groq API Key** (optional)  

### ⚡ Installation

```bash
# 1️⃣ Clone repository
git clone https://github.com/yourusername/momentum.git
cd momentum

# 2️⃣ Install dependencies
bun install

# 3️⃣ Setup environment variables
cp .env.example .env
```

### 🔧 Environment Variables

Create a `.env` file with the following configuration:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Better Auth (minimum 32 characters)
BETTER_AUTH_SECRET=generate_with_openssl_rand_base64_32
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Groq AI (optional for AI insights)
GROQ_API_KEY=your_groq_api_key
```

<details>
<summary>🔑 How to Get Environment Variables</summary>

### DATABASE_URL (Supabase)
1. Create account at [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy connection string (use URI format)

### BETTER_AUTH_SECRET
```bash
openssl rand -base64 32
```

### Google OAuth
1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### GROQ_API_KEY
1. Sign up at [Groq](https://console.groq.com)
2. Create API key in dashboard

</details>

### 🗃️ Database Setup

```bash
# Generate migrations
bun run db:generate

# Push schema to database
bun run db:push

# (Optional) Open Drizzle Studio
bun run db:studio
```

### 🎯 Run Development Server

```bash
# Start dev server
bun dev
```

Open **http://localhost:3000** in your browser 🎉

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

// Habit Logs Table (for heatmap)
habit_logs {
  id: uuid
  habit_id: uuid (FK)
  user_id: uuid (FK)
  completed_at: date
  created_at: timestamp
}
```

Full diagram: [DATABASE.md](./docs/DATABASE.md)

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

Full documentation: [API_SPECS.md](./docs/API_SPECS.md)

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

**Prompt Engineering** details: [AI_STRATEGY.md](./docs/AI_STRATEGY.md)

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
bun run build

# Preview locally
bun run preview
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/momentum)

1. Push to GitHub
2. Connect repository in Vercel
3. Set environment variables
4. Deploy! 🚀

---

## 🧪 Available Scripts

```bash
# Development
bun dev              # Start dev server
bun run build        # Build for production
bun run preview      # Preview production build

# Code Quality
bun run lint         # Run ESLint
bun run typecheck    # TypeScript type checking

# Database
bun run db:generate  # Generate Drizzle migrations
bun run db:push      # Push schema changes
bun run db:migrate   # Run migrations
bun run db:studio    # Open Drizzle Studio
```

---

## 🤝 Contributing

Contributions are welcome! Please create a **Pull Request**.

### 🔄 Development Workflow

1. **Fork** this repository
2. **Clone** your fork
3. Create a **feature** branch (`git checkout -b feature/amazing-feature`)
4. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. Create a **Pull Request**

### 📝 Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

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

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with:

- ![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?logo=nuxt.js&logoColor=white) [Nuxt](https://nuxt.com)
- 🎨 [Nuxt UI](https://ui.nuxt.com) - Component Library
- ⚡ [Groq](https://groq.com) - AI Inference
- 🔐 [Better Auth](https://better-auth.com) - Authentication
- 🗄️ [Drizzle ORM](https://orm.drizzle.team) - Database Toolkit
- 🎨 [TailwindCSS](https://tailwindcss.com) - Styling

---

## 📞 Contact & Support

- 📧 Email: rifkyakhmad911@gmail.com
- 🐛 Bug Reports: [GitHub Issues](https://github.com/yourusername/momentum/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/momentum/discussions)

---

<div align="center">

**⭐ If this project is helpful, give it a star! ⭐**

Built with 🌳 by RifkyA110

[⬆ Back to Top](#-momentum)

</div>
