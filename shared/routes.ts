import { z } from 'zod';
import { insertQuizSchema, insertQuestionSchema, insertResultSchema, quizzes, questions, results } from './schema';

// Shared error schemas
export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

// API Contract definition
export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({ email: z.string().email(), password: z.string() }),
      responses: {
        200: z.object({ id: z.number(), email: z.string(), role: z.string() }),
        401: errorSchemas.unauthorized,
      }
    }
  },
  quizzes: {
    list: {
      method: 'GET' as const,
      path: '/api/quizzes' as const,
      responses: { 200: z.array(z.custom<typeof quizzes.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/quizzes' as const,
      input: insertQuizSchema,
      responses: { 
        201: z.custom<typeof quizzes.$inferSelect>(), 
        400: errorSchemas.validation 
      }
    }
  },
  questions: {
    listByQuiz: {
      method: 'GET' as const,
      path: '/api/quizzes/:quizId/questions' as const,
      responses: { 200: z.array(z.custom<typeof questions.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/quizzes/:quizId/questions' as const,
      input: insertQuestionSchema.omit({ quizId: true }),
      responses: { 
        201: z.custom<typeof questions.$inferSelect>(), 
        400: errorSchemas.validation 
      }
    }
  },
  results: {
    create: {
      method: 'POST' as const,
      path: '/api/results' as const,
      input: insertResultSchema,
      responses: { 
        201: z.custom<typeof results.$inferSelect>(), 
        400: errorSchemas.validation 
      }
    },
    leaderboard: {
      method: 'GET' as const,
      path: '/api/leaderboard' as const,
      responses: { 
        200: z.array(z.object({ 
          id: z.number(), 
          userId: z.number(), 
          quizId: z.number(), 
          score: z.number(), 
          totalQuestions: z.number(),
          userEmail: z.string() 
        })) 
      }
    }
  }
};

// URL Builder helper for the frontend
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// Type helpers
export type QuizResponse = z.infer<typeof api.quizzes.create.responses[201]>;
export type QuestionResponse = z.infer<typeof api.questions.create.responses[201]>;
export type ResultResponse = z.infer<typeof api.results.create.responses[201]>;
