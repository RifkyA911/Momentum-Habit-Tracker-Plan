# MCP (Model Context Protocol) Integration

## Overview
Momentum uses MCP (Model Context Protocol) to expose database tools for AI integration. This enables AI systems (like Claude Desktop) to directly query the database for behavioral pattern analysis and insights generation.

## Architecture
```
AI System (Claude Desktop)
    ↓
MCP Server (server/mcp/index.ts)
    ↓
Drizzle ORM
    ↓
PostgreSQL (Neon)
```

## Available MCP Tools

### 1. `get_user_profile`
Get user profile data by user ID.

**Parameters:**
- `userId` (string, required): User ID to fetch profile for

**Returns:**
- User profile object with id, name, email, image, createdAt

### 2. `get_user_habits`
Get all habits for a specific user.

**Parameters:**
- `userId` (string, required): User ID to fetch habits for

**Returns:**
- Array of habit objects with id, userId, title, icon, color, description, orderIndex, createdAt, updatedAt

### 3. `get_habit_tasks`
Get all tasks for a specific habit.

**Parameters:**
- `habitId` (string, required): Habit ID to fetch tasks for

**Returns:**
- Array of task objects with id, habitId, text, completed, completedAt, orderIndex, createdAt, updatedAt

### 4. `get_completed_tasks_by_date`
Get completed tasks for a user within a date range.

**Parameters:**
- `userId` (string, required): User ID to fetch data for
- `startDate` (string, required): Start date in ISO format (YYYY-MM-DD)
- `endDate` (string, required): End date in ISO format (YYYY-MM-DD)

**Returns:**
- Array of completed tasks with taskId, habitId, text, completedAt, habitTitle

### 5. `get_habit_completion_stats`
Get completion statistics for habits within a date range.

**Parameters:**
- `userId` (string, required): User ID to fetch stats for
- `days` (number, optional): Number of days to look back (default: 30)

**Returns:**
- Array of stats with habitId, habitTitle, completedCount

### 6. `get_user_activity_heatmap`
Get daily completion counts for heatmap visualization.

**Parameters:**
- `userId` (string, required): User ID to fetch heatmap data for
- `year` (number, optional): Year to fetch data for (default: current year)

**Returns:**
- Object with date keys and completion count values: `{ "YYYY-MM-DD": count }`

## Setup

### 1. Install Dependencies
Dependencies are already added to package.json:
- `@modelcontextprotocol/sdk` - MCP SDK
- `tsx` - TypeScript executor

Run:
```bash
bun install
```

### 2. Configure Environment Variables
Ensure `.env` contains:
```env
DATABASE_URL=postgres://...
```

### 3. Claude Desktop Configuration
The MCP configuration is in `.claude/mcp_config.json`:

```json
{
  "mcpServers": {
    "momentum-db-tools": {
      "command": "bun",
      "args": ["run", "mcp:server"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

### 4. Run MCP Server
```bash
bun run mcp:server
```

## Usage in AI Integration

### Example: Generating Behavioral Insights
When the AI needs to analyze user patterns:

1. Call `get_user_activity_heatmap` to get completion data
2. Call `get_habit_completion_stats` to get habit-specific stats
3. Call `get_completed_tasks_by_date` for detailed analysis
4. Process the data and generate insights

### Example AI Prompt
```
Analyze the user's habit completion patterns using the MCP tools:
1. Get heatmap data for the current year
2. Get completion stats for the last 30 days
3. Identify patterns in completion times
4. Generate 2-3 reflective observations about their consistency
```

## Integration with Groq AI

The MCP tools are designed to work seamlessly with the Groq AI integration in `server/api/groq.post.ts`. The AI can:

1. Query database via MCP tools
2. Aggregate and analyze the data
3. Generate behavioral insights
4. Return insights to the UI

## Testing

To test the MCP server manually:

```bash
# Start the server
bun run mcp:server

# In another terminal, test with MCP client
# or use Claude Desktop to verify tool availability
```

## Security Considerations

- MCP server runs with database credentials from environment variables
- All tools require userId parameter for data isolation
- No direct SQL injection risk (Drizzle ORM handles parameterization)
- Claude Desktop configuration uses environment variable substitution

## Future Enhancements

Potential additions to MCP tools:
- `create_habit` - Create new habits via AI
- `update_habit` - Modify habit properties
- `log_completion` - Log habit completions
- `get_streak_data` - Calculate streak information
- `get_time_patterns` - Analyze completion time patterns
