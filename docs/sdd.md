# Momentum - Software Design Document (SDD) v2

## 1. Project Overview
**Project Name:** Momentum  
**Type:** AI-powered Habit Tracking Micro SaaS  
**Goal:** Build a modern fullstack productivity platform with polished UX, optimistic UI, and AI-powered insights, designed as a production-grade portfolio.

## 2. Product Vision
- Provide a clean, dopamine-driven productivity experience.
- Use visual feedback (GitHub-style heatmap) to increase user consistency.
- Showcase modern engineering with realistic timelines and maintainable architecture.

## 3. Tech Stack (Revised)
- **Package Manager:** Bun (STRICT: Do NOT use pnpm or npm)
- **Frontend:** Nuxt 4, Vue 3, TypeScript, TailwindCSS v4, Nuxt UI / shadcn-vue
- **Backend:** H3 (Nuxt Server Routes)
- **Database:** PostgreSQL (Supabase / Neon) + Drizzle ORM
- **Auth:** Better Auth
- **State Management:** Pinia (for local state caching)
- **AI Integration:** Groq (LLaMA 3) via `groq-sdk` for fast & cheap inference
- **Analytics & Monitoring:** PostHog & Sentry
- **Deployment:** Vercel

## 4. Architecture (Simplified & Realistic)
To ensure the project can be completed in a 4-week MVP without over-engineering:
- **Client (Vue/Nuxt) → API Layer (H3) → Drizzle ORM → PostgreSQL**
- *Note:* Removed "Repository Layer" to embrace Drizzle's SQL-like lightweight nature.
- *Note:* Changed "Offline-first sync queue" to **Optimistic UI Updates**. Realtime sync is dropped from the MVP to focus on shipping core features fast, using Optimistic UI to provide an instant-feel experience.

## 5. Core Features
1. **Habit CRUD System**: Manage daily habits.
2. **Optimistic UI Check-ins**: Clicking complete feels instant without waiting for server response.
3. **Advanced Heatmap**: GitHub-style contribution graph.
4. **AI Consistency Insights (Powered by Groq)**: Analyze user's habit logs and provide actionable feedback.

## 6. MVP Timeline (4 Weeks)
- **Week 1:** Project setup, Database Schema (Drizzle), Authentication (Better Auth).
- **Week 2:** Habit CRUD + Optimistic UI state management + Heatmap visualization.
- **Week 3:** AI Consistency Insights integration (Groq API), prompt engineering.
- **Week 4:** UX Polish, Animations, Monitoring setup (Sentry/PostHog), Deployment.

## 7. AI Implementation Strategy
- **Provider:** Groq
- **Model:** `llama3-8b-8192` or `llama3-70b-8192` (Extremely fast generation, cost-effective).
- **Workflow:** User requests an insight → H3 server route fetches last 30 days of habit logs → Sends context to Groq API → Returns streaming response to frontend.
