import { db } from "./db";
import {
  users, quizzes, questions, results,
  type User, type InsertUser,
  type Quiz, type InsertQuiz,
  type Question, type InsertQuestion,
  type Result, type InsertResult
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getQuizzes(): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;

  getQuestionsByQuizId(quizId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  createResult(result: InsertResult): Promise<Result>;
  getLeaderboard(): Promise<Array<Result & { userEmail: string }>>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getQuizzes(): Promise<Quiz[]> {
    return await db.select().from(quizzes);
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async getQuestionsByQuizId(quizId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.quizId, quizId));
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async createResult(result: InsertResult): Promise<Result> {
    const [newResult] = await db.insert(results).values(result).returning();
    return newResult;
  }

  async getLeaderboard(): Promise<Array<Result & { userEmail: string }>> {
    const data = await db.select({
      id: results.id,
      userId: results.userId,
      quizId: results.quizId,
      score: results.score,
      totalQuestions: results.totalQuestions,
      createdAt: results.createdAt,
      userEmail: users.email,
    })
    .from(results)
    .innerJoin(users, eq(results.userId, users.id))
    .orderBy(desc(results.score))
    .limit(50);

    return data;
  }
}

export const storage = new DatabaseStorage();
