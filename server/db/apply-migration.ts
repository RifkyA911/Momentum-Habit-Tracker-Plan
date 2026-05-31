import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.")
  process.exit(1)
}

const client = postgres(process.env.DATABASE_URL)

async function main() {
  console.log("Applying migration...")
  
  try {
    // Drop old columns from habitTask
    await client`
      ALTER TABLE "habitTask" 
      DROP COLUMN IF EXISTS "completed",
      DROP COLUMN IF EXISTS "completedAt"
    `
    console.log("✓ Dropped completed and completedAt from habitTask")
    
    // Create habitTaskCompletion table
    await client`
      CREATE TABLE IF NOT EXISTS "habitTaskCompletion" (
        id TEXT PRIMARY KEY,
        "taskId" TEXT NOT NULL REFERENCES "habitTask"(id) ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        "date" TEXT NOT NULL,
        "completedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `
    console.log("✓ Created habitTaskCompletion table")
    
    console.log("Migration applied successfully!")
  } catch (error: any) {
    console.error("Error applying migration:", error.message)
  } finally {
    await client.end()
  }
}

main()
