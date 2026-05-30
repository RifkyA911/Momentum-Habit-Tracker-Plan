import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull()
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId").notNull().references(() => user.id)
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId").notNull().references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt"),
	updatedAt: timestamp("updatedAt")
});

export const habit = pgTable("habit", {
	id: text("id").primaryKey(),
	userId: text("userId").notNull().references(() => user.id, { onDelete: 'cascade' }),
	title: text("title").notNull(),
	icon: text("icon").notNull(),
	color: text("color").notNull(),
	description: text("description"),
	orderIndex: integer("orderIndex").default(0),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow()
});

export const habitTask = pgTable("habitTask", {
	id: text("id").primaryKey(),
	habitId: text("habitId").notNull().references(() => habit.id, { onDelete: 'cascade' }),
	text: text("text").notNull(),
	completed: boolean("completed").notNull().default(false),
	completedAt: timestamp("completedAt"),
	orderIndex: integer("orderIndex").default(0),
	createdAt: timestamp("createdAt").notNull().defaultNow()
});

export const habitLog = pgTable("habitLog", {
	id: text("id").primaryKey(),
	habitId: text("habitId").notNull().references(() => habit.id, { onDelete: 'cascade' }),
	userId: text("userId").notNull().references(() => user.id, { onDelete: 'cascade' }),
	completedAt: timestamp("completedAt").notNull().defaultNow()
});

export const feedback = pgTable("feedback", {
	id: text("id").primaryKey(),
	userId: text("userId").references(() => user.id, { onDelete: 'set null' }),
	name: text("name").notNull(),
	email: text("email").notNull(),
	category: text("category").notNull(),
	rating: integer("rating").notNull(),
	feedback: text("feedback").notNull(),
	createdAt: timestamp("createdAt").notNull().defaultNow()
});
