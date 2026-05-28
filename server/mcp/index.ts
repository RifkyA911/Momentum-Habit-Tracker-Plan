import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { db } from '../utils/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import * as schema from '../db/schema';

// Create MCP server
const server = new Server(
  {
    name: 'momentum-db-tools',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_user_profile',
        description: 'Get user profile data by user ID',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User ID to fetch profile for',
            },
          },
          required: ['userId'],
        },
      },
      {
        name: 'get_user_habits',
        description: 'Get all habits for a specific user',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User ID to fetch habits for',
            },
          },
          required: ['userId'],
        },
      },
      {
        name: 'get_habit_tasks',
        description: 'Get all tasks for a specific habit',
        inputSchema: {
          type: 'object',
          properties: {
            habitId: {
              type: 'string',
              description: 'Habit ID to fetch tasks for',
            },
          },
          required: ['habitId'],
        },
      },
      {
        name: 'get_completed_tasks_by_date',
        description: 'Get completed tasks for a user within a date range',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User ID to fetch data for',
            },
            startDate: {
              type: 'string',
              description: 'Start date in ISO format (YYYY-MM-DD)',
            },
            endDate: {
              type: 'string',
              description: 'End date in ISO format (YYYY-MM-DD)',
            },
          },
          required: ['userId', 'startDate', 'endDate'],
        },
      },
      {
        name: 'get_habit_completion_stats',
        description: 'Get completion statistics for habits within a date range',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User ID to fetch stats for',
            },
            days: {
              type: 'number',
              description: 'Number of days to look back (default: 30)',
            },
          },
          required: ['userId'],
        },
      },
      {
        name: 'get_user_activity_heatmap',
        description: 'Get daily completion counts for heatmap visualization',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User ID to fetch heatmap data for',
            },
            year: {
              type: 'number',
              description: 'Year to fetch data for (default: current year)',
            },
          },
          required: ['userId'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_user_profile': {
        const { userId } = args as { userId: string };
        const userProfile = await db
          .select({
            id: schema.user.id,
            name: schema.user.name,
            email: schema.user.email,
            image: schema.user.image,
            createdAt: schema.user.createdAt,
          })
          .from(schema.user)
          .where(eq(schema.user.id, userId))
          .limit(1);

        if (userProfile.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'User not found' }, null, 2),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(userProfile[0], null, 2),
            },
          ],
        };
      }

      case 'get_user_habits': {
        const { userId } = args as { userId: string };
        const habits = await db
          .select()
          .from(schema.habit)
          .where(eq(schema.habit.userId, userId))
          .orderBy(schema.habit.orderIndex);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(habits, null, 2),
            },
          ],
        };
      }

      case 'get_habit_tasks': {
        const { habitId } = args as { habitId: string };
        const tasks = await db
          .select()
          .from(schema.habitTask)
          .where(eq(schema.habitTask.habitId, habitId))
          .orderBy(schema.habitTask.orderIndex);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tasks, null, 2),
            },
          ],
        };
      }

      case 'get_completed_tasks_by_date': {
        const { userId, startDate, endDate } = args as {
          userId: string;
          startDate: string;
          endDate: string;
        };

        const completedTasks = await db
          .select({
            taskId: schema.habitTask.id,
            habitId: schema.habitTask.habitId,
            text: schema.habitTask.text,
            completedAt: schema.habitTask.completedAt,
            habitTitle: schema.habit.title,
          })
          .from(schema.habitTask)
          .innerJoin(schema.habit, eq(schema.habitTask.habitId, schema.habit.id))
          .where(
            and(
              eq(schema.habit.userId, userId),
              sql`${schema.habitTask.completedAt}::date >= ${startDate}`,
              sql`${schema.habitTask.completedAt}::date <= ${endDate}`,
              eq(schema.habitTask.completed, true)
            )
          )
          .orderBy(desc(schema.habitTask.completedAt));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(completedTasks, null, 2),
            },
          ],
        };
      }

      case 'get_habit_completion_stats': {
        const { userId, days = 30 } = args as {
          userId: string;
          days?: number;
        };

        const stats = await db
          .select({
            habitId: schema.habitTask.habitId,
            habitTitle: schema.habit.title,
            completedCount: sql<number>`count(*)`.as('completedCount'),
          })
          .from(schema.habitTask)
          .innerJoin(schema.habit, eq(schema.habitTask.habitId, schema.habit.id))
          .where(
            and(
              eq(schema.habit.userId, userId),
              eq(schema.habitTask.completed, true),
              sql`${schema.habitTask.completedAt} >= NOW() - INTERVAL '${days} days'`
            )
          )
          .groupBy(schema.habitTask.habitId, schema.habit.title)
          .orderBy(sql`count(*) DESC`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      case 'get_user_activity_heatmap': {
        const { userId, year } = args as {
          userId: string;
          year?: number;
        };

        const currentYear = year || new Date().getFullYear();

        const heatmapData = await db
          .select({
            date: sql<string>`DATE(${schema.habitTask.completedAt})`.as('date'),
            count: sql<number>`count(*)`.as('count'),
          })
          .from(schema.habitTask)
          .innerJoin(schema.habit, eq(schema.habitTask.habitId, schema.habit.id))
          .where(
            and(
              eq(schema.habit.userId, userId),
              eq(schema.habitTask.completed, true),
              sql`EXTRACT(YEAR FROM ${schema.habitTask.completedAt}) = ${currentYear}`
            )
          )
          .groupBy(sql`DATE(${schema.habitTask.completedAt})`)
          .orderBy(sql`DATE(${schema.habitTask.completedAt})`);

        // Convert to object format { "YYYY-MM-DD": count }
        const heatmapMap = heatmapData.reduce(
          (acc, item) => {
            acc[item.date] = item.count;
            return acc;
          },
          {} as Record<string, number>
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(heatmapMap, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: 'Unknown tool' }, null, 2),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: 'Tool execution failed',
              details: error instanceof Error ? error.message : String(error),
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Momentum MCP Database Tools server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
