<div align="center">

# Momentum

### Build momentum, not motivation.

A calm, dopamine-aware habit tracker with behavioral pattern analysis.

[![Nuxt 4](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Postgres-00E699?logo=postgresql&logoColor=white)](https://neon.tech)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## What is Momentum?

Momentum is a habit tracking system that focuses on **consistency reflection** rather than gamification or motivation.

Most habit trackers try to motivate you. Momentum doesn't. Instead, it quietly observes your patterns and reflects them back — helping you build self-awareness around your behavior over time.

**Core ideas:**
- Instant feedback through optimistic UI — no spinners, no waiting.
- A GitHub-style contribution heatmap that visualizes your daily consistency at a glance, aligned perfectly by calendar month columns and filterable by years on the right side.
- A History Tracker that allows browsing the last 14 days, viewing completed tasks on any specific day, and toggling completions on past dates directly.
- An AI reflection engine (powered by Groq/LLaMA 3) that detects behavioral patterns and generates short, data-driven observations.
- Drag-and-drop task and habit reordering that persists across sessions.

This is not a motivational app. This is a behavioral system.

---

## Philosophy

> "Missing one day rarely breaks momentum, but missing two often does."

Momentum is designed around the psychology of consistency, not productivity. The product avoids gamification traps (streaks as punishment, badges, leaderboards) and instead provides calm, reflective data about your actual behavior.

The AI does not coach. It observes.

**Example insights:**
- *"You complete 42% more habits after 7 PM."*
- *"Your consistency drops slightly during weekends."*
- *"Reading is currently your most stable habit."*

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 4 (Vue 3, TypeScript) |
| Styling | TailwindCSS v4 + Nuxt UI |
| Database | PostgreSQL via [Neon](https://neon.tech) |
| ORM | Drizzle ORM |
| Auth | Better Auth (Google OAuth + Email) |
| AI | Groq (LLaMA 3) — fast, cheap inference |
| Deployment | Vercel |
| Package Manager | Bun |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.1+
- A PostgreSQL database ([Neon](https://neon.tech) recommended)
- Groq API key (optional, for AI reflections)

### Setup

```bash
# Clone
git clone https://github.com/RifkyA911/Momentum-Habit-Tracker-Plan.git
cd Momentum-Habit-Tracker-Plan

# Install
bun install

# Configure
cp .env.example .env
# Edit .env with your database URL, auth secret, and API keys

# Push database schema
bunx drizzle-kit push

# Run
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
DATABASE_URL=           # Neon Postgres connection string
BETTER_AUTH_SECRET=     # Min 32 chars (openssl rand -base64 32)
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=       # Google OAuth (optional)
GOOGLE_CLIENT_SECRET=   # Google OAuth (optional)
GROQ_API_KEY=           # Groq API key (optional)
```

---

## Project Structure

```
momentum/
├── app/
│   ├── components/        # Vue components (HabitCard, GitHubHeatmap, etc.)
│   ├── pages/             # Route pages (landing, dashboard, demo, auth)
│   ├── layouts/           # Layout templates (default, dashboard, auth)
│   └── middleware/        # Route guards (auth)
├── server/
│   ├── api/               # H3 API endpoints (habits, tasks, auth, AI)
│   ├── db/                # Drizzle schema
│   └── utils/             # Server utilities (db connection, auth config)
├── docs/                  # Product documentation (SDD, AI strategy, etc.)
├── nuxt.config.ts
├── drizzle.config.ts
└── package.json
```

---


## Architecture

```
Client (Vue/Nuxt)
    ↓
API Layer (H3)
    ↓
MCP DB Tools
    ↓
Drizzle ORM
    ↓
Neon Postgres
    ↓
Groq API (AI reflections)
```

**Design decisions:**
- MCP DB Tools digunakan untuk expose data habit_logs, habits, dan users secara efisien, serta membangun pipeline analisis otomatis ke AI (Groq).
- No repository layer — Drizzle is lightweight enough to use directly in route handlers.
- Optimistic UI — state updates instantly, syncs to database in the background, reverts on failure.
- No real-time sync — intentionally excluded from MVP to keep complexity manageable.

---


## AI Reflection Engine

The AI feature is not a chatbot. It's a behavioral pattern detector.

**How it works:**
1. User triggers a reflection from the dashboard.
2. Server mengambil data habit_logs, habits, dan users via MCP DB Tools.
3. Data dikumpulkan dan dikirim ke Groq (LLaMA 3) dengan prompt khusus untuk insight reflektif.
4. Insight singkat berbasis data ditampilkan di UI.

**The AI generates:** Short behavioral insights and reflective observations.  
**The AI does not generate:** Motivational quotes, generic encouragement, or chatbot conversations.

See [AI_STRATEGY.md](./docs/AI_STRATEGY.md) for prompt engineering details.

**Note:** Integrasi MCP DB Tools memudahkan pipeline data untuk analisis AI dan scalable untuk future automation.

---

## Scripts

```bash
bun dev              # Development server
bun run build        # Production build
bun run preview      # Preview production build
bun run lint         # ESLint
bun run typecheck    # TypeScript checking
bun run mcp:server   # Run MCP server for AI integration
bunx tsx server/db/seed.ts  # Seed database with test data (1 year, 4 streak gaps)
bunx drizzle-kit push       # Push schema to database
bunx drizzle-kit studio     # Open Drizzle Studio
```

### Database Seeding

The project includes a comprehensive seeding script that generates realistic test data:

```bash
bunx tsx server/db/seed.ts
```

**Seeding Features:**
- **1 Year of Data**: Generates 365 days of historical habit data
- **4 Streak Gaps**: Intentionally creates 4 periods of no completions to simulate real-life breaks
- **5 Habits**: Morning Workout, Read Books, Mindful Meditation, Write Journal, Code Projects
- **~1,662 Tasks**: Total tasks across all habits with realistic completion patterns

---

## MCP Integration

Momentum uses MCP (Model Context Protocol) to expose database tools for AI integration. This enables AI systems (like Claude Desktop) to directly query the database for behavioral pattern analysis.

**Available MCP Tools:**
- `get_user_profile` - Get user profile data
- `get_user_habits` - Get all habits for a user
- `get_habit_tasks` - Get tasks for a specific habit
- `get_completed_tasks_by_date` - Get completed tasks within a date range
- `get_habit_completion_stats` - Get completion statistics
- `get_user_activity_heatmap` - Get daily completion counts for heatmap

**Setup:**
```bash
# MCP server is configured in .claude/mcp_config.json
# Run with:
bun run mcp:server
```

See [`.docs/MCP_INTEGRATION.md`](./.docs/MCP_INTEGRATION.md) for detailed documentation.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [sdd.md](./docs/sdd.md) | Software design document |
| [AI_STRATEGY.md](./docs/AI_STRATEGY.md) | AI behavioral analysis strategy |
| [PRD.md](./docs/PRD.md) | Product requirements |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture |
| [DATABASE.md](./docs/DATABASE.md) | Database schema |
| [API_SPECS.md](./docs/API_SPECS.md) | API documentation |

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

Built by [RifkyA911](https://github.com/RifkyA911)

</div>
