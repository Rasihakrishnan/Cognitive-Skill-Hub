import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // @Controller - Auth
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = api.auth.login.input.parse(req.body);
      
      let user = await storage.getUserByEmail(email);
      // Auto-register mock behavior for MVP
      if (!user) {
        const role = email.includes("admin") ? "admin" : "user";
        user = await storage.createUser({ email, password, role });
      } else {
        if (user.password !== password) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      }
      res.status(200).json({ id: user.id, email: user.email, role: user.role });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(401).json({ message: "Invalid email or password format" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // @Controller - Quizzes
  app.get(api.quizzes.list.path, async (_req, res) => {
    const quizzesList = await storage.getQuizzes();
    res.json(quizzesList);
  });

  app.post(api.quizzes.create.path, async (req, res) => {
    try {
      const input = api.quizzes.create.input.parse(req.body);
      const quiz = await storage.createQuiz(input);
      res.status(201).json(quiz);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // @Controller - Questions
  app.get(api.questions.listByQuiz.path, async (req, res) => {
    const quizId = parseInt(req.params.quizId);
    if (isNaN(quizId)) return res.status(400).json({ message: "Invalid quiz ID" });
    const questionsList = await storage.getQuestionsByQuizId(quizId);
    res.json(questionsList);
  });

  app.post(api.questions.create.path, async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      if (isNaN(quizId)) return res.status(400).json({ message: "Invalid quiz ID" });

      const input = api.questions.create.input.parse(req.body);
      const question = await storage.createQuestion({ ...input, quizId });
      res.status(201).json(question);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // @Controller - Results
  app.post(api.results.create.path, async (req, res) => {
    try {
      const input = api.results.create.input.parse(req.body);
      const result = await storage.createResult(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.get(api.results.leaderboard.path, async (_req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  // Seed the DB on startup
  await seedDatabase();

  return httpServer;
}

// @Service - Initial DB Seed
async function seedDatabase() {
  try {
    const quizzes = await storage.getQuizzes();
    if (quizzes.length === 0) {
      // Mock data for initial testing
      const admin = await storage.createUser({ email: "admin@neurohire.com", password: "password", role: "admin" });
      const quiz1 = await storage.createQuiz({ title: "Cognitive Logic Test 1", description: "A logic and pattern recognition test." });
      
      await storage.createQuestion({
        quizId: quiz1.id,
        text: "What comes next in the sequence: 2, 4, 8, 16, ...?",
        options: ["24", "32", "64", "20"],
        correctAnswer: "32",
        aiHint: "Think about powers of 2."
      });
      
      await storage.createQuestion({
        quizId: quiz1.id,
        text: "If all Bloops are Razzies and all Razzies are Lazzies, then are all Bloops Lazzies?",
        options: ["Yes", "No", "Cannot be determined"],
        correctAnswer: "Yes",
        aiHint: "This is a classic syllogism. If A is B, and B is C, then A is C."
      });

      const user1 = await storage.createUser({ email: "candidate1@test.com", password: "password", role: "user" });
      await storage.createResult({ userId: user1.id, quizId: quiz1.id, score: 2, totalQuestions: 2 });
    }
  } catch (error) {
    console.error("Database seed skipped. Likely missing schema/DB:", error);
  }
}
