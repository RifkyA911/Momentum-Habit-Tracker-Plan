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

  // 2. Create realistic habits (4 habits)
  const habitsToCreate = [
    { title: 'Morning Workout', icon: '🏋️', color: '#3b82f6', description: 'Strength training and cardio sessions' },
    { title: 'Read Books', icon: '📚', color: '#10b981', description: 'Read at least 15 pages of non-fiction' },
    { title: 'Mindful Meditation', icon: '🧘', color: '#8b5cf6', description: 'Calm breathing and mental relaxation' },
    { title: 'Write Journal', icon: '📝', color: '#f59e0b', description: 'Log thoughts, progress, and daily reflection' }
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

  // 3. Generate 5 tasks per habit
  console.log("Generating tasks...")
  let taskCount = 0

  for (const habit of insertedHabits) {
    for (let i = 0; i < 5; i++) {
      const taskId = faker.string.uuid()
      const isCompleted = Math.random() > 0.3
      await db.insert(schema.habitTask).values({
        id: taskId,
        habitId: habit!.id,
        text: `Task ${i + 1} for ${habit!.title}`,
        completed: isCompleted,
        completedAt: isCompleted ? new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000) : null,
        orderIndex: i,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      })
      taskCount++
    }
  }

  console.log(`Seeded ${taskCount} tasks across habits.`)

  // 5. Seed feedback data
  console.log("Seeding feedback data...")
  const feedbackCategories = ['bug', 'feature', 'uiux', 'other']
  const feedbackData = [
    { name: 'John Doe', email: 'john@example.com', category: 'feature', rating: 5, feedback: 'Great app! Would love to see dark mode improvements.' },
    { name: 'Jane Smith', email: 'jane@example.com', category: 'uiux', rating: 4, feedback: 'The UI is clean but could use more animations.' },
    { name: 'Mike Johnson', email: 'mike@example.com', category: 'bug', rating: 3, feedback: 'Found a bug in the habit completion flow.' },
    { name: 'Sarah Wilson', email: 'sarah@example.com', category: 'other', rating: 5, feedback: 'Love the dopamine effects!' }
  ]

  for (const fb of feedbackData) {
    await db.insert(schema.feedback).values({
      id: faker.string.uuid(),
      userId: testUser!.id,
      name: fb.name,
      email: fb.email,
      category: fb.category,
      rating: fb.rating,
      feedback: fb.feedback,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
    })
  }

  console.log(`Seeded ${feedbackData.length} feedback entries.`)

  process.exit(0)
}

main().catch(err => {
  console.error("Seeding failed:", err)
  process.exit(1)
})
