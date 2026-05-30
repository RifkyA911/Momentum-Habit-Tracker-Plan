import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { faker } from '@faker-js/faker'
import * as dotenv from 'dotenv'
import { eq } from 'drizzle-orm'

dotenv.config()

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.")
  process.exit(1)
}

const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client, { schema })

async function main() {
  console.log("🌱 Seeding database...")

  // 1. Get or create a user
  let testUser = await db.query.user.findFirst()
  if (!testUser) {
    console.log("No user found. Creating a test user...")
    const newUserId = faker.string.uuid()
    const inserted = await db.insert(schema.user).values({
      id: newUserId,
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()
    testUser = inserted[0]
  }

  console.log(`Using user: ${testUser?.name} (${testUser?.id})`)
  
  // Store the user ID for later use
  console.log(`USER_ID=${testUser?.id}`)

  // Clear existing habits and tasks to make it fresh & consistent
  console.log("Cleaning old habits and tasks...")
  const userHabits = await db.select({ id: schema.habit.id }).from(schema.habit).where(eq(schema.habit.userId, testUser!.id))
  for (const h of userHabits) {
    await db.delete(schema.habitTask).where(eq(schema.habitTask.habitId, h.id))
  }
  await db.delete(schema.habit).where(eq(schema.habit.userId, testUser!.id))

  // 2. Create realistic habits
  const habitsToCreate = [
    { title: 'Morning Workout', icon: '🏋️', color: '#3b82f6', description: 'Strength training and cardio sessions' },
    { title: 'Read Books', icon: '📚', color: '#10b981', description: 'Read at least 15 pages of non-fiction' },
    { title: 'Mindful Meditation', icon: '🧘', color: '#8b5cf6', description: 'Calm breathing and mental relaxation' },
    { title: 'Write Journal', icon: '📝', color: '#f59e0b', description: 'Log thoughts, progress, and daily reflection' },
    { title: 'Code Projects', icon: '💻', color: '#ec4899', description: 'Contribute to side projects and open source' }
  ]

  const insertedHabits = []
  for (let i = 0; i < habitsToCreate.length; i++) {
    const h = habitsToCreate[i]
    const habitId = faker.string.uuid()
    const inserted = await db.insert(schema.habit).values({
      id: habitId,
      userId: testUser!.id,
      title: h!.title,
      icon: h!.icon,
      color: h!.color,
      description: h!.description,
      orderIndex: i,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }).returning()
    insertedHabits.push(inserted[0])
  }

  console.log(`Created ${insertedHabits.length} habits.`)

  // 3. Generate completed tasks for the last 365 days to fill the heatmap
  console.log("Generating historical completed tasks...")
  const today = new Date()
  let taskCount = 0

  // Define 4 streak gap periods (bolong-bolong streak)
  // Each gap is 5-7 days of no completions
  const streakGaps = [
    { start: 45, end: 50 },   // Gap 1: days 45-50 ago
    { start: 90, end: 96 },   // Gap 2: days 90-96 ago
    { start: 180, end: 187 },  // Gap 3: days 180-187 ago
    { start: 270, end: 278 }   // Gap 4: days 270-278 ago
  ]

  for (let dayOffset = 365; dayOffset >= 1; dayOffset--) {
    const targetDate = new Date()
    targetDate.setDate(today.getDate() - dayOffset)
    const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6
    
    // Check if this day is in a streak gap
    const isInGap = streakGaps.some(gap => dayOffset >= gap.start && dayOffset <= gap.end)
    
    if (isInGap) {
      // Skip completions during streak gaps
      continue
    }
    
    // Choose how many habits are completed on this day (weekdays have higher rate)
    const completionChance = isWeekend ? 0.4 : 0.75
    
    for (const habit of insertedHabits) {
      if (Math.random() < completionChance) {
        // Create 1-2 completed tasks for this habit on this day
        const numTasks = Math.random() > 0.5 ? 2 : 1
        for (let t = 0; t < numTasks; t++) {
          const taskId = faker.string.uuid()
          await db.insert(schema.habitTask).values({
            id: taskId,
            habitId: habit!.id,
            text: `Completed session of ${habit!.title}`,
            completed: true,
            completedAt: new Date(targetDate),
            orderIndex: t,
            createdAt: new Date(targetDate)
          })
          taskCount++
        }
      }
    }
  }

  // 4. Create active (uncompleted or recently completed) tasks for today
  console.log("Generating today's active tasks...")
  const taskOptions = [
    ["15 min Stretch", "Pushups set", "5km Running"],
    ["Read 1 chapter", "Summarize notes", "Highlight takeaways"],
    ["10 min deep breathing", "Gratitude listing", "Post-meditation journaling"],
    ["Morning pages", "Bullet journal update", "Gratitude entry"],
    ["Fix Github issue", "Refactor module", "Write unit test"]
  ]

  for (let i = 0; i < insertedHabits.length; i++) {
    const habit = insertedHabits[i]
    const options = taskOptions[i]
    
    if (!habit || !options) continue
    
    for (let t = 0; t < options.length; t++) {
      const taskId = faker.string.uuid()
      const isDone = Math.random() > 0.4
      await db.insert(schema.habitTask).values({
        id: taskId as any,
        habitId: habit.id as any,
        text: options[t] as any,
        completed: isDone,
        completedAt: isDone ? new Date() : null,
        orderIndex: t,
        createdAt: new Date()
      })
      taskCount++
    }
  }

  console.log(`Seeding complete! Successfully seeded ${taskCount} tasks across habits.`)
  process.exit(0)
}

main().catch(err => {
  console.error("Seeding failed:", err)
  process.exit(1)
})
