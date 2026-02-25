import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// --- Quizzes ---

export function useQuizzes() {
  return useQuery({
    queryKey: [api.quizzes.list.path],
    queryFn: async () => {
      const res = await fetch(api.quizzes.list.path);
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      return api.quizzes.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.quizzes.create.input>) => {
      const res = await fetch(api.quizzes.create.path, {
        method: api.quizzes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create quiz");
      return api.quizzes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.quizzes.list.path] });
    },
  });
}

// --- Questions ---

export function useQuestions(quizId: number) {
  const path = buildUrl(api.questions.listByQuiz.path, { quizId });
  return useQuery({
    queryKey: [path],
    queryFn: async () => {
      const res = await fetch(path);
      if (!res.ok) throw new Error("Failed to fetch questions");
      return api.questions.listByQuiz.responses[200].parse(await res.json());
    },
    enabled: !!quizId,
  });
}

export function useCreateQuestion(quizId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.questions.create.input>) => {
      const path = buildUrl(api.questions.create.path, { quizId });
      const res = await fetch(path, {
        method: api.questions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create question");
      return api.questions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      const path = buildUrl(api.questions.listByQuiz.path, { quizId });
      queryClient.invalidateQueries({ queryKey: [path] });
    },
  });
}

// --- Results ---

export function useCreateResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.results.create.input>) => {
      const res = await fetch(api.results.create.path, {
        method: api.results.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit result");
      return api.results.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.results.leaderboard.path] });
    },
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: [api.results.leaderboard.path],
    queryFn: async () => {
      const res = await fetch(api.results.leaderboard.path);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return api.results.leaderboard.responses[200].parse(await res.json());
    },
  });
}
