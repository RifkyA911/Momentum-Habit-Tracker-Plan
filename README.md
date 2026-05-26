# Momentum - AI-Powered Habit Tracker

Build momentum, not motivation. A modern habit tracking application with AI-powered insights, dopamine-driven UX, and GitHub-style consistency visualization.

## Features

- **Optimistic UI Check-ins** - Instant visual feedback when completing habits
- **GitHub-Style Heatmap** - Visualize your consistency over time
- **AI Consistency Insights** - Powered by Groq (LLaMA 3) for actionable behavioral advice
- **Streak Tracking** - Don't break the chain
- **Better Auth** - Secure authentication with Google OAuth & email/password

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3 + TypeScript)
- **Styling**: TailwindCSS v4 + Nuxt UI
- **Database**: PostgreSQL (Supabase) + Drizzle ORM
- **Auth**: Better Auth
- **AI**: Groq (LLaMA 3)
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL database (Supabase recommended)
- Groq API key (optional, for AI features)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd momentum_habit_tracker_plan
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file with the following variables:
```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Better Auth
BETTER_AUTH_SECRET=your_secret_key_min_32_chars
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Groq AI (optional)
GROQ_API_KEY=your_groq_api_key
```

4. Run database migrations:
```bash
pnpm run db:push
```

5. Start the development server:
```bash
pnpm dev
```

Visit `http://localhost:3000` in your browser.

## Project Structure

```
/app                    # Frontend application
├── components/         # Vue components
├── pages/              # Route pages
├── layouts/            # Layout templates
├── middleware/         # Route middleware
├── utils/              # Utilities
└── assets/             # Static assets

/server                 # Backend API
├── api/                # API endpoints (H3)
├── db/                 # Database schema & migrations
└── utils/              # Server utilities

/docs                   # Documentation
├── PRD.md             # Product requirements
├── ARCHITECTURE.md    # System architecture
├── DATABASE.md       # Database schema
├── API_SPECS.md      # API specifications
├── AI_STRATEGY.md    # AI integration strategy
└── UI_UX.md          # UI/UX guidelines
```

## Database Schema

### Core Tables

- **users** - User profiles and authentication data
- **habits** - User-defined habits (title, color, icon, frequency)
- **habit_logs** - Daily check-in records for heatmap visualization
- **streaks** - (Optional) Cached streak calculations

## API Endpoints

### Habits
- `GET /api/habits` - Get all user habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit

### Check-ins
- `POST /api/habits/:id/log` - Log habit completion
- `DELETE /api/habits/:id/log` - Undo today's check-in

### Analytics
- `GET /api/habits/heatmap` - Get yearly heatmap data
- `POST /api/groq` - AI consistency insights

## Deployment

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Deploy to Vercel

The project is configured for Vercel deployment. Simply connect your repository and deploy.

## Key Design Patterns

### Optimistic UI

User interactions feel instant:
1. UI updates immediately on click
2. State updates in Pinia store
3. API request fires in background
4. Reverts on error, shows toast notification

### AI Insights Flow

1. User clicks "Analyze my Week"
2. Backend fetches last 7 days of habit logs
3. Compresses data to summary string
4. Sends to Groq API with behavioral psychology prompt
5. Returns actionable, motivating feedback

## Documentation

For detailed technical documentation, see the `/docs` folder:

- [Product Requirements (PRD)](./docs/PRD.md)
- [System Architecture](./docs/ARCHITECTURE.md)
- [Database Design](./docs/DATABASE.md)
- [API Specifications](./docs/API_SPECS.md)
- [AI Strategy](./docs/AI_STRATEGY.md)
- [UI/UX Guidelines](./docs/UI_UX.md)
- [Software Design Document](./docs/sdd.md)

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript checks
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Secret for session tokens (min 32 chars) |
| `BETTER_AUTH_URL` | Yes | Base URL for auth callbacks |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GROQ_API_KEY` | No | Groq API key for AI features |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Built with [Nuxt](https://nuxt.com)
- UI components from [Nuxt UI](https://ui.nuxt.com)
- AI powered by [Groq](https://groq.com)
- Auth by [Better Auth](https://better-auth.com)
