import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Entities (Tables) ---

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // 'admin' or 'user'
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  text: text("text").notNull(),
  options: text("options").array().notNull(), // Array of answer choices
  correctAnswer: text("correct_answer").notNull(),
  aiHint: text("ai_hint"), // Optional AI hint
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Zod Schemas for Validation ---

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertQuizSchema = createInsertSchema(quizzes).omit({ id: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertResultSchema = createInsertSchema(results).omit({ id: true, createdAt: true });

// --- TypeScript Types ---

export type User = typeof users.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Result = typeof results.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertResult = z.infer<typeof insertResultSchema>;
