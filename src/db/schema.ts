import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Users (quiz creators) ───────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // nanoid
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── Sessions (auth) ────────────────────────────────────────────────
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── Magic Links ─────────────────────────────────────────────────────
export const magicLinks = sqliteTable("magic_links", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── Questions ───────────────────────────────────────────────────────
export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  category: text("category").notNull(), // e.g., "openness", "empathy"
  textSelf: text("text_self").notNull(), // "I am adventurous"
  textFriend: text("text_friend").notNull(), // "This person is adventurous"
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
  slug: text("slug").notNull().unique(),
  title: text("title"), // optional custom title
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
    score: integer("score").notNull(), // 1-5
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex("self_responses_quiz_question").on(
      table.quizId,
      table.questionId
    ),
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
    displayName: text("display_name"), // optional nickname
    browserToken: text("browser_token").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex("respondents_quiz_browser").on(
      table.quizId,
      table.browserToken
    ),
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
    score: integer("score").notNull(), // 1-5
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
  status: text("status").notNull().default("pending"), // pending, completed, refunded
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
  type: text("type").notNull(), // "new_response", "results_ready"
  sentAt: text("sent_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
