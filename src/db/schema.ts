import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════════════
// Better Auth tables (managed by Better Auth, DO NOT modify structure)
// ═══════════════════════════════════════════════════════════════════════

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ═══════════════════════════════════════════════════════════════════════
// App tables (our domain models)
// ═══════════════════════════════════════════════════════════════════════

// ─── Question Sets ───────────────────────────────────────────────────
export const questionSets = sqliteTable("question_sets", {
  id: text("id").primaryKey(),
  version: integer("version").notNull(),
  label: text("label").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── Questions ───────────────────────────────────────────────────────
export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  questionSetId: text("question_set_id")
    .notNull()
    .references(() => questionSets.id),
  category: text("category").notNull(),
  textSelf: text("text_self").notNull(),
  textFriend: text("text_friend").notNull(),
  sortOrder: integer("sort_order").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── Quizzes ─────────────────────────────────────────────────────────
export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  questionSetId: text("question_set_id")
    .notNull()
    .references(() => questionSets.id),
  slug: text("slug").notNull().unique(),
  title: text("title"),
  responseCount: integer("response_count").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── Self Responses (creator's answers) ──────────────────────────────
export const selfResponses = sqliteTable(
  "self_responses",
  {
    id: text("id").primaryKey(),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id),
    score: integer("score").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex("self_responses_quiz_question").on(table.quizId, table.questionId),
  ]
);

// ─── Respondents (anonymous friends) ─────────────────────────────────
export const respondents = sqliteTable(
  "respondents",
  {
    id: text("id").primaryKey(),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    displayName: text("display_name"),
    browserToken: text("browser_token").notNull(),
    ipHash: text("ip_hash"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex("respondents_quiz_browser").on(table.quizId, table.browserToken),
    uniqueIndex("respondents_quiz_ip").on(table.quizId, table.ipHash),
  ]
);

// ─── Friend Responses ────────────────────────────────────────────────
export const friendResponses = sqliteTable(
  "friend_responses",
  {
    id: text("id").primaryKey(),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    respondentId: text("respondent_id")
      .notNull()
      .references(() => respondents.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id),
    score: integer("score").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex("friend_responses_respondent_question").on(
      table.respondentId,
      table.questionId
    ),
  ]
);

// ─── Purchases ───────────────────────────────────────────────────────
export const purchases = sqliteTable("purchases", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  quizId: text("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  stripeSessionId: text("stripe_session_id").unique(),
  amountCents: integer("amount_cents").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  completedAt: text("completed_at"),
});

// ─── Email Notifications ─────────────────────────────────────────────
export const emailNotifications = sqliteTable("email_notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  quizId: text("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  sentAt: text("sent_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
