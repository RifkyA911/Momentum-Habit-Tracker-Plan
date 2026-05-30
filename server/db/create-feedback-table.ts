import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.")
  process.exit(1)
}

const client = postgres(process.env.DATABASE_URL)

async function main() {
  console.log("Creating feedback table...")
  
  try {
    await client`
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        "userId" TEXT REFERENCES "user"(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        category TEXT NOT NULL,
        rating INTEGER NOT NULL,
        feedback TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `
    console.log("✓ Feedback table created successfully")
  } catch (error: any) {
    console.error("Error creating feedback table:", error.message)
  } finally {
    await client.end()
  }
}

main()
