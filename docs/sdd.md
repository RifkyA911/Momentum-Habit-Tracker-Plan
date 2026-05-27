# Momentum - Software Design Document (SDD) v3

## 1. Project Overview
**Project Name:** Momentum  
**Type:** AI-Powered Behavioral Reflection & Habit Tracker  
**Goal:** Build a modern, calm, and emotionally intelligent productivity platform. Momentum is not a motivational coach; it is a reflective behavioral system designed to build consistency without hustle culture.

## 2. Product Vision & Positioning
**Core Philosophy:** "Build momentum, not motivation."
- **Tone:** Calm, premium, intelligent, supportive, reflective, minimal, and emotionally aware. (Inspired by Apple Health insights and Linear).
- **Avoid:** Cringe startup copy, productivity guru tone, hustle culture, gamification overload, and generic AI chatbots.
- **Experience:** A dopamine-aware habit tracker that feels like a quiet consistency companion rather than a nagging assistant.

## 3. Tech Stack
- **Package Manager:** Bun (STRICT: Do NOT use pnpm or npm)
- **Frontend:** Nuxt 4, Vue 3, TypeScript, TailwindCSS v4, Nuxt UI / shadcn-vue
- **Backend:** H3 (Nuxt Server Routes)
- **Database:** PostgreSQL (Supabase / Neon) + Drizzle ORM
- **Auth:** Better Auth
- **State Management:** Pinia (for local state caching)
- **AI Integration:** Groq (LLaMA 3) via `groq-sdk` for fast & cheap inference
- **Analytics & Monitoring:** PostHog & Sentry
- **Deployment:** Vercel

## 4. Architecture
To ensure the project remains robust and scalable yet realistic for an MVP:
- **Client (Vue/Nuxt) → API Layer (H3) → Drizzle ORM → PostgreSQL**
- **Optimistic UI Updates:** Drag-and-drop reordering, task completion, and habit creation happen instantly in the UI while syncing to the database in the background to provide a premium, snappy feel.

## 5. Core Features
1. **Habit & Task Management**: Group tasks into habits, sortable via native drag-and-drop.
2. **Advanced Heatmap**: GitHub-style contribution graph that visualizes daily completion rates gracefully without horizontal scrolling, aligned precisely using CSS grid columns and filterable by dynamic year selection.
3. **History Tracker**: Interactive 14-day history view with date navigation. Allows viewing which tasks existed and were completed on a particular day, with full capability to toggle completion history (writing back to database).
4. **Behavioral AI Reflections**: Shifted from generic motivation to deep pattern detection.

## 6. AI Insight System Behavior (The Reflection Engine)
The AI does not preach; it observes.
- **Analyzes:** Habit completion patterns, streak stability, skipped days, active hours, strongest/weakest habits, and weekly consistency shifts.
- **Generates:** Short insights, reflective observations, and subtle behavioral suggestions based purely on data.
- **Examples:**
  - *"You complete 42% more habits after 7 PM."*
  - *"Your consistency drops slightly during weekends."*
  - *"Reading is currently your most stable habit."*
  - *"Missing one day rarely breaks momentum, but missing two often does."*

## 7. MVP Timeline (4 Weeks)
- **Week 1:** Project setup, Database Schema (Drizzle), Authentication (Better Auth).
- **Week 2:** Habit CRUD + Optimistic UI state management + Drag & Drop UX.
- **Week 3:** Heatmap visualization + AI Behavioral Reflections (Groq API).
- **Week 4:** UX Polish, Responsive Design, Monitoring setup, Deployment.
